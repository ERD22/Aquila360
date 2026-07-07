import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

const ALERTA_PRIORIDAD = {
	vencida: 0,
	por_vencer: 1,
	vigente: 2,
	sin_fecha: 3
};

function calcularAlerta(vencimiento) {
	if (!vencimiento) {
		return 'sin_fecha';
	}

	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);

	const venc = new Date(vencimiento);
	venc.setHours(0, 0, 0, 0);

	if (venc < hoy) {
		return 'vencida';
	}

	const diferenciaDias = (venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);

	if (diferenciaDias <= 7) {
		return 'por_vencer';
	}

	return 'vigente';
}

export const load = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const cotizacionesRaw = await prisma.cotizacion.findMany({
		where: {
			estado: {
				in: ['APROBADA', 'FACTURADA']
			}
		},
		include: {
			cliente: true,
			pagos: true
		},
		orderBy: {
			vencimiento: 'asc'
		}
	});

	const cuentas = cotizacionesRaw
		.map((cot) => {
			const total = Number(cot.total);
			const totalPagado = cot.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
			const saldo = total - totalPagado;
			const alerta = calcularAlerta(cot.vencimiento);

			return {
				id: cot.id,
				numero: cot.numero,
				cliente: cot.cliente,
				total,
				saldo,
				vencimiento: cot.vencimiento,
				alerta
			};
		})
		.filter((cuenta) => cuenta.saldo > 0);

	cuentas.sort((a, b) => {
		const prioridadA = ALERTA_PRIORIDAD[a.alerta];
		const prioridadB = ALERTA_PRIORIDAD[b.alerta];

		if (prioridadA !== prioridadB) {
			return prioridadA - prioridadB;
		}

		if (!a.vencimiento && !b.vencimiento) return 0;
		if (!a.vencimiento) return 1;
		if (!b.vencimiento) return -1;

		return new Date(a.vencimiento).getTime() - new Date(b.vencimiento).getTime();
	});

	const resumen = {
		cuentas: cuentas.length,
		saldoTotal: cuentas.reduce((sum, cuenta) => sum + cuenta.saldo, 0)
	};

	return { cuentas, resumen };
};
