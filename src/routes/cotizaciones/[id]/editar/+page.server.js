import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load = async ({ params, locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const [cotizacionRaw, clientes] = await Promise.all([
		prisma.cotizacion.findUnique({
			where: { id: params.id },
			include: {
				conceptos: { orderBy: { id: 'asc' } }
			}
		}),
		prisma.cliente.findMany({
			where: { activo: true },
			orderBy: { nombre: 'asc' }
		})
	]);

	if (!cotizacionRaw) {
		error(404, 'Cotización no encontrada.');
	}

	if (cotizacionRaw.estado !== 'BORRADOR') {
		redirect(303, `/cotizaciones/${params.id}`);
	}

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
		}))
	};

	return { cotizacion, clientes };
};

export const actions = {
	default: async ({ params, request, locals }) => {
		const { userId } = locals.auth();

		if (!userId) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const clienteId = String(formData.get('clienteId') ?? '').trim();
		const notas = String(formData.get('notas') ?? '').trim() || null;
		const vencimientoRaw = String(formData.get('vencimiento') ?? '').trim() || null;
		const vencimiento = vencimientoRaw ? new Date(vencimientoRaw) : null;

		const descripciones = formData.getAll('descripcion').map((v) => String(v ?? '').trim());
		const cantidades = formData.getAll('cantidad').map((v) => Number(String(v ?? '').trim()));
		const precios = formData.getAll('precioUnitario').map((v) => Number(String(v ?? '').trim()));

		const errores = {};

		if (!clienteId) {
			errores.clienteId = 'Elige un cliente para esta cotización.';
		}

		const conceptos = [];
		for (let i = 0; i < descripciones.length; i++) {
			const descripcion = descripciones[i];
			if (!descripcion) continue;
			const cantidad = Number.isFinite(cantidades[i]) ? cantidades[i] : 0;
			const precioUnitario = Number.isFinite(precios[i]) ? precios[i] : 0;
			const subtotal = cantidad * precioUnitario;
			conceptos.push({ descripcion, cantidad, precioUnitario, subtotal });
		}

		if (conceptos.length === 0) {
			errores.general = 'Agrega al menos un concepto con descripción.';
		}

		if (Object.keys(errores).length > 0) {
			return fail(400, {
				errores,
				valores: { clienteId, notas, vencimiento: vencimientoRaw, descripciones, cantidades, precios }
			});
		}

		const cotizacionActual = await prisma.cotizacion.findUnique({
			where: { id: params.id }
		});

		if (!cotizacionActual || cotizacionActual.estado !== 'BORRADOR') {
			return fail(400, { errores: { general: 'Esta cotización ya no se puede editar.' } });
		}

		const subtotalGeneral = conceptos.reduce((sum, c) => sum + c.subtotal, 0);
		const iva = subtotalGeneral * 0.16;
		const total = subtotalGeneral + iva;

		await prisma.$transaction([
			prisma.concepto.deleteMany({ where: { cotizacionId: params.id } }),
			prisma.cotizacion.update({
				where: { id: params.id },
				data: {
					clienteId,
					notas,
					vencimiento,
					subtotal: subtotalGeneral,
					iva,
					total,
					conceptos: {
						create: conceptos.map((c) => ({
							descripcion: c.descripcion,
							cantidad: c.cantidad,
							precioUnitario: c.precioUnitario,
							subtotal: c.subtotal
						}))
					}
				}
			})
		]);

		redirect(303, `/cotizaciones/${params.id}`);
	}
};
