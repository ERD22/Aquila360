import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load = async ({ params, locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const clienteRaw = await prisma.cliente.findUnique({
		where: { id: params.id },
		include: {
			cotizaciones: {
				include: { pagos: true },
				orderBy: { creadoEn: 'desc' }
			}
		}
	});

	if (!clienteRaw) {
		error(404, 'Cliente no encontrado.');
	}

	let totalFacturado = 0;
	let totalCobrado = 0;
	let saldoPendiente = 0;

	const cotizaciones = clienteRaw.cotizaciones.map((cot) => {
		const total = Number(cot.total);
		const pagado = cot.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
		const saldo = total - pagado;

		if (cot.estado === 'FACTURADA' || cot.estado === 'PAGADA') {
			totalFacturado += total;
		}

		totalCobrado += pagado;

		if ((cot.estado === 'APROBADA' || cot.estado === 'FACTURADA') && saldo > 0) {
			saldoPendiente += saldo;
		}

		return {
			...cot,
			total,
			pagado,
			subtotal: Number(cot.subtotal),
			iva: Number(cot.iva),
			pagos: cot.pagos.map((p) => ({ ...p, monto: Number(p.monto) }))
		};
	});

	const { cotizaciones: _, ...clienteBase } = clienteRaw;
	const cliente = clienteBase;

	return {
		cliente,
		cotizaciones,
		totales: { totalFacturado, totalCobrado, saldoPendiente }
	};
};
