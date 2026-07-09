import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { enviarCorreoCotizacion } from '$lib/server/email.js';

const ESTADOS_VALIDOS = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'FACTURADA', 'PAGADA'];
const METODOS_VALIDOS = ['TRANSFERENCIA', 'EFECTIVO', 'CHEQUE', 'TARJETA'];

export const load = async ({ params, locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const cotizacionRaw = await prisma.cotizacion.findUnique({
		where: { id: params.id },
		include: {
			cliente: true,
			conceptos: {
				orderBy: { id: 'asc' }
			},
			historial: {
				orderBy: { creadoEn: 'desc' }
			},
			pagos: {
				orderBy: { fecha: 'desc' }
			}
		}
	});

	if (!cotizacionRaw) {
		error(404, 'Cotización no encontrada.');
	}

	const totalPagado = cotizacionRaw.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
	const saldo = Number(cotizacionRaw.total) - totalPagado;

	const cotizacion = {
		...cotizacionRaw,
		subtotal: Number(cotizacionRaw.subtotal),
		iva: Number(cotizacionRaw.iva),
		total: Number(cotizacionRaw.total),
		conceptos: cotizacionRaw.conceptos.map((c) => ({
			...c,
			cantidad: Number(c.cantidad),
			precioUnitario: Number(c.precioUnitario),
			subtotal: Number(c.subtotal)
		})),
		pagos: cotizacionRaw.pagos.map((p) => ({
			...p,
			monto: Number(p.monto)
		}))
	};

	return { cotizacion, totalPagado, saldo };
};

export const actions = {
	cambiarEstado: async ({ params, request, locals }) => {
		const { userId } = locals.auth();

		if (!userId) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const nuevoEstado = String(formData.get('nuevoEstado') ?? '').trim();

		if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
			return fail(400, { error: 'El estado no es válido.' });
		}

		const cotizacionActual = await prisma.cotizacion.findUnique({
			where: { id: params.id }
		});

		if (!cotizacionActual) {
			return fail(404, { error: 'Cotización no encontrada.' });
		}

		await prisma.$transaction([
			prisma.cotizacion.update({
				where: { id: params.id },
				data: { estado: nuevoEstado }
			}),
			prisma.historialCot.create({
				data: {
					cotizacionId: params.id,
					estadoAnterior: cotizacionActual.estado,
					estadoNuevo: nuevoEstado,
					nota: null
				}
			})
		]);

		if (nuevoEstado === 'ENVIADA') {
			try {
				const cotizacionConCliente = await prisma.cotizacion.findUnique({
					where: { id: params.id },
					include: { cliente: true, conceptos: true }
				});
				await enviarCorreoCotizacion({
					cotizacion: cotizacionConCliente,
					cliente: cotizacionConCliente.cliente
				});
			} catch (emailError) {
				console.error('Error al enviar correo de cotización:', emailError);
			}
		}

		redirect(303, `/cotizaciones/${params.id}`);
	},

	registrarPago: async ({ params, request, locals }) => {
		const { userId } = locals.auth();

		if (!userId) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const monto = Number(String(formData.get('monto') ?? '').trim());
		const metodo = String(formData.get('metodo') ?? '').trim();
		const referencia = String(formData.get('referencia') ?? '').trim() || null;
		const fechaRaw = String(formData.get('fecha') ?? '').trim() || null;
		const fecha = fechaRaw ? new Date(fechaRaw) : new Date();

		const errores = {};

		if (!Number.isFinite(monto) || monto <= 0) {
			errores.monto = 'El monto debe ser mayor a 0.';
		}

		if (!METODOS_VALIDOS.includes(metodo)) {
			errores.metodo = 'Elige un método de pago válido.';
		}

		if (Object.keys(errores).length > 0) {
			return fail(400, { errores });
		}

		const cotizacionActual = await prisma.cotizacion.findUnique({
			where: { id: params.id }
		});

		if (!cotizacionActual) {
			return fail(404, { error: 'Cotización no encontrada.' });
		}

		const pagosActuales = await prisma.pago.aggregate({
			where: { cotizacionId: params.id },
			_sum: { monto: true }
		});

		const totalPagadoActual = Number(pagosActuales._sum.monto ?? 0);
		const saldoActual = Number(cotizacionActual.total) - totalPagadoActual;

		const operaciones = [
			prisma.pago.create({
				data: {
					cotizacionId: params.id,
					monto,
					fecha,
					metodo,
					referencia
				}
			})
		];

		if (saldoActual - monto <= 0 && cotizacionActual.estado !== 'PAGADA') {
			operaciones.push(
				prisma.cotizacion.update({
					where: { id: params.id },
					data: { estado: 'PAGADA' }
				}),
				prisma.historialCot.create({
					data: {
						cotizacionId: params.id,
						estadoAnterior: cotizacionActual.estado,
						estadoNuevo: 'PAGADA',
						nota: 'Cotización saldada automáticamente al registrar el pago.'
					}
				})
			);
		}

		await prisma.$transaction(operaciones);

		redirect(303, `/cotizaciones/${params.id}`);
	},

	eliminarPago: async ({ params, request, locals }) => {
		const { userId } = locals.auth();

		if (!userId) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const pagoId = String(formData.get('pagoId') ?? '').trim();

		if (!pagoId) {
			return fail(400, { error: 'Falta el identificador del pago.' });
		}

		const cotizacionActual = await prisma.cotizacion.findUnique({
			where: { id: params.id }
		});

		if (!cotizacionActual) {
			return fail(404, { error: 'Cotización no encontrada.' });
		}

		if (cotizacionActual.estado === 'PAGADA') {
			return fail(400, {
				error: 'No se puede eliminar un pago de una cotización ya saldada.'
			});
		}

		const pago = await prisma.pago.findFirst({
			where: { id: pagoId, cotizacionId: params.id }
		});

		if (!pago) {
			return fail(404, { error: 'Pago no encontrado.' });
		}

		await prisma.pago.delete({ where: { id: pagoId } });

		redirect(303, `/cotizaciones/${params.id}`);
	}
};
