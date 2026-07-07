import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const cotizacionesRaw = await prisma.cotizacion.findMany({
		include: { cliente: true },
		orderBy: { creadoEn: 'desc' }
	});

	const cotizaciones = cotizacionesRaw.map((c) => ({
		...c,
		subtotal: Number(c.subtotal),
		iva: Number(c.iva),
		total: Number(c.total)
	}));

	return { cotizaciones };
};