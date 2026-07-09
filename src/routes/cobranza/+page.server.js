import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);

	const cotizacionesRaw = await prisma.cotizacion.findMany({
		where: {
			estado: { in: ['APROBADA', 'FACTURADA'] }
		},
		include: {
			cliente: true,
			pagos: true
		}
	});

	const cuentas = cotizacionesRaw
		.map((cot) => {
			const total = Number(cot.total);
			const pagado = cot.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
			const saldoPendiente = total - pagado;

			const fechaCot = new Date(cot.fecha);
			fechaCot.setHours(0, 0, 0, 0);
			const diasTranscurridos = Math.floor((hoy.getTime() - fechaCot.getTime()) / (1000 * 60 * 60 * 24));

			let alerta;
			if (diasTranscurridos > 30) {
				alerta = 'vencida';
			} else if (diasTranscurridos > 15) {
				alerta = 'atencion';
			} else {
				alerta = 'normal';
			}

			return {
				id: cot.id,
				numero: cot.numero,
				cliente: { nombre: cot.cliente?.nombre ?? null, empresa: cot.cliente?.empresa ?? null },
				fecha: cot.fecha.toISOString(),
				total,
				pagado,
				saldoPendiente,
				diasTranscurridos,
				alerta
			};
		})
		.filter((c) => c.saldoPendiente > 0)
		.sort((a, b) => b.diasTranscurridos - a.diasTranscurridos);

	const carteraPendienteTotal = cuentas.reduce((sum, c) => sum + c.saldoPendiente, 0);
	const carteraVencida = cuentas
		.filter((c) => c.alerta === 'vencida')
		.reduce((sum, c) => sum + c.saldoPendiente, 0);

	const resumen = {
		total: cuentas.length,
		carteraPendienteTotal,
		carteraVencida
	};

	return { cuentas, resumen };
};
