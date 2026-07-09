import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

function nombreMes(fecha) {
	return fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }).replace('.', '');
}

export const load = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const hoy = new Date();
	const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
	const inicioMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
	const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);

	const [cotizaciones, pagos, ultimasCotizacionesRaw] = await Promise.all([
		prisma.cotizacion.findMany({
			include: { cliente: true, pagos: true }
		}),
		prisma.pago.findMany({ orderBy: { fecha: 'asc' } }),
		prisma.cotizacion.findMany({
			orderBy: { creadoEn: 'desc' },
			take: 5,
			include: { cliente: true }
		})
	]);

	let totalFacturado = 0;
	let totalCobrado = 0;
	let carteraPendiente = 0;
	let cotizacionesActivas = 0;
	const cotizacionesPorEstado = {};

	for (const cot of cotizaciones) {
		const total = Number(cot.total);
		const totalPagadoCot = cot.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
		const saldo = total - totalPagadoCot;

		cotizacionesPorEstado[cot.estado] = (cotizacionesPorEstado[cot.estado] ?? 0) + 1;

		if (cot.estado !== 'BORRADOR' && cot.creadoEn >= inicioMesActual) {
			totalFacturado += total;
		}

		if (cot.estado === 'ENVIADA' || cot.estado === 'APROBADA' || cot.estado === 'FACTURADA') {
			cotizacionesActivas += 1;
		}

		if ((cot.estado === 'APROBADA' || cot.estado === 'FACTURADA') && saldo > 0) {
			carteraPendiente += saldo;
		}
	}

	for (const pago of pagos) {
		if (pago.fecha >= inicioMesActual && pago.fecha < inicioMesSiguiente) {
			totalCobrado += Number(pago.monto);
		}
	}

	const saldoPorCliente = {};

	for (const cot of cotizaciones) {
		if ((cot.estado === 'APROBADA' || cot.estado === 'FACTURADA') && cot.cliente) {
			const total = Number(cot.total);
			const pagado = cot.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
			const saldo = total - pagado;
			if (saldo > 0) {
				const id = cot.cliente.id;
				if (!saldoPorCliente[id]) {
					saldoPorCliente[id] = {
						nombre: cot.cliente.nombre,
						empresa: cot.cliente.empresa,
						saldoPendiente: 0
					};
				}
				saldoPorCliente[id].saldoPendiente += saldo;
			}
		}
	}

	const topClientes = Object.values(saldoPorCliente)
		.sort((a, b) => b.saldoPendiente - a.saldoPendiente)
		.slice(0, 3);

	const ultimasCotizaciones = ultimasCotizacionesRaw.map((cot) => ({
		id: cot.id,
		numero: cot.numero,
		cliente: cot.cliente?.nombre ?? '-',
		estado: cot.estado,
		total: Number(cot.total),
		fecha: cot.fecha.toISOString()
	}));

	const mesActual = pagos
		.filter((p) => p.fecha >= inicioMesActual && p.fecha < inicioMesSiguiente)
		.reduce((sum, p) => sum + Number(p.monto), 0);

	const mesAnterior = pagos
		.filter((p) => p.fecha >= inicioMesAnterior && p.fecha < inicioMesActual)
		.reduce((sum, p) => sum + Number(p.monto), 0);

	let porcentaje = null;
	let direccion = 'sin_datos';

	if (mesAnterior > 0) {
		porcentaje = Number((((mesActual - mesAnterior) / mesAnterior) * 100).toFixed(2));
		if (porcentaje > 0) direccion = 'sube';
		else if (porcentaje < 0) direccion = 'baja';
		else direccion = 'igual';
	} else if (mesActual > 0) {
		direccion = 'sin_datos';
	}

	const tendenciaCobrado = { mesActual, mesAnterior, porcentaje, direccion };

	const ingresosPorMes = [];

	for (let i = 5; i >= 0; i--) {
		const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
		const siguiente = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 1);

		const total = pagos
			.filter((p) => p.fecha >= fechaBase && p.fecha < siguiente)
			.reduce((sum, p) => sum + Number(p.monto), 0);

		ingresosPorMes.push({ mes: nombreMes(fechaBase), total });
	}

	return {
		kpis: { totalFacturado, totalCobrado, carteraPendiente, cotizacionesActivas },
		cotizacionesPorEstado,
		ingresosPorMes,
		ultimasCotizaciones,
		topClientes,
		tendenciaCobrado
	};
};
