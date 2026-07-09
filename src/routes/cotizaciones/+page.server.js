import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

const ESTADOS_VALIDOS = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'FACTURADA', 'PAGADA'];

export const load = async ({ url, locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const estado = String(url.searchParams.get('estado') ?? '').trim();
	const clienteId = String(url.searchParams.get('clienteId') ?? '').trim();
	const desde = String(url.searchParams.get('desde') ?? '').trim();
	const hasta = String(url.searchParams.get('hasta') ?? '').trim();

	const where = {};

	if (estado && ESTADOS_VALIDOS.includes(estado)) {
		where.estado = estado;
	}

	if (clienteId) {
		where.clienteId = clienteId;
	}

	if (desde || hasta) {
		where.fecha = {};
		if (desde) {
			where.fecha.gte = new Date(desde);
		}
		if (hasta) {
			const finDia = new Date(hasta);
			finDia.setHours(23, 59, 59, 999);
			where.fecha.lte = finDia;
		}
	}

	const [cotizacionesRaw, clientes] = await Promise.all([
		prisma.cotizacion.findMany({
			where,
			include: { cliente: true },
			orderBy: { creadoEn: 'desc' }
		}),
		prisma.cliente.findMany({
			where: { activo: true },
			orderBy: { nombre: 'asc' }
		})
	]);

	const cotizaciones = cotizacionesRaw.map((c) => ({
		...c,
		subtotal: Number(c.subtotal),
		iva: Number(c.iva),
		total: Number(c.total)
	}));

	return {
		cotizaciones,
		clientes,
		filtros: { estado, clienteId, desde, hasta }
	};
};
