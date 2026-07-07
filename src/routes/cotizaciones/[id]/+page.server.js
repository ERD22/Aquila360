import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

const ESTADOS_VALIDOS = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'FACTURADA', 'PAGADA'];

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
			}
		}
	});

	if (!cotizacionRaw) {
		error(404, 'Cotización no encontrada.');
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

	return { cotizacion };
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

		return { exito: true };
	}
};
