import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

const ESTADOS_ACTIVOS = ['BORRADOR', 'ENVIADA', 'APROBADA', 'FACTURADA'];

function nombreMes(fecha) {
	return fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }).replace('.', '');
}

function inicioMes(fecha) {
	return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

export const load = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const [cotizaciones, pagos] = await Promise.all([
		prisma.cotizacion.findMany({
			include: {
				cliente: true,
				pagos: true
			}
		}),
		prisma.pago.findMany({
			orderBy: {
				fecha: 'asc'
			}
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

		if (cot.estado === 'FACTURADA' || cot.estado === 'PAGADA') {
			totalFacturado += total;
		}

		if (ESTADOS_ACTIVOS.includes(cot.estado)) {
			cotizacionesActivas += 1;
		}

		if ((cot.estado === 'APROBADA' || cot.estado === 'FACTURADA') && saldo > 0) {
			carteraPendiente += saldo;
		}
	}

	for (const pago of pagos) {
		totalCobrado += Number(pago.monto);
	}

	const hoy = new Date();
	const limiteVencimiento = new Date(hoy);
	limiteVencimiento.setDate(hoy.getDate() + 15);
	limiteVencimiento.setHours(23, 59, 59, 999);

	const cotizacionesPorVencer = cotizaciones
		.filter((cot) => {
			if (cot.estado !== 'APROBADA' && cot.estado !== 'FACTURADA') return false;
			if (!cot.vencimiento) return false;
			const total = Number(cot.total);
			const totalPagado = cot.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
			const saldo = total - totalPagado;
			const venc = new Date(cot.vencimiento);
			return saldo > 0 && venc >= hoy && venc <= limiteVencimiento;
		})
		.map((cot) => {
			const total = Number(cot.total);
			const totalPagado = cot.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
			return {
				numero: cot.numero,
				cliente: cot.cliente?.nombre ?? 'Cliente no disponible',
				saldo: total - totalPagado,
				vencimiento: cot.vencimiento
			};
		})
		.sort((a, b) => new Date(a.vencimiento).getTime() - new Date(b.vencimiento).getTime())
		.slice(0, 5);

	const facturadoPorCliente = {};

	for (const cot of cotizaciones) {
		if ((cot.estado === 'FACTURADA' || cot.estado === 'PAGADA') && cot.cliente) {
			const id = cot.cliente.id;
			if (!facturadoPorCliente[id]) {
				facturadoPorCliente[id] = {
					nombre: cot.cliente.nombre,
					empresa: cot.cliente.empresa,
					total: 0
				};
			}
			facturadoPorCliente[id].total += Number(cot.total);
		}
	}

	const topClientes = Object.values(facturadoPorCliente)
		.filter((cliente) => cliente.total > 0)
		.sort((a, b) => b.total - a.total)
		.slice(0, 3)
		.map((cliente) => ({
			nombre: cliente.nombre,
			empresa: cliente.empresa,
			totalFacturado: cliente.total
		}));

	const inicioMesActual = inicioMes(hoy);
	const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
	const inicioMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);

	const mesActual = pagos
		.filter((p) => {
			const fechaPago = new Date(p.fecha);
			return fechaPago >= inicioMesActual && fechaPago < inicioMesSiguiente;
		})
		.reduce((sum, p) => sum + Number(p.monto), 0);

	const mesAnterior = pagos
		.filter((p) => {
			const fechaPago = new Date(p.fecha);
			return fechaPago >= inicioMesAnterior && fechaPago < inicioMesActual;
		})
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

	const tendenciaCobrado = {
		mesActual,
		mesAnterior,
		porcentaje,
		direccion
	};

	const ingresosPorMes = [];

	for (let i = 5; i >= 0; i--) {
		const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
		const siguiente = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 1);

		const total = pagos
			.filter((p) => {
				const fechaPago = new Date(p.fecha);
				return fechaPago >= fechaBase && fechaPago < siguiente;
			})
			.reduce((sum, p) => sum + Number(p.monto), 0);

		ingresosPorMes.push({
			mes: nombreMes(fechaBase),
			total
		});
	}

	return {
		kpis: {
			totalFacturado,
			totalCobrado,
			carteraPendiente,
			cotizacionesActivas
		},
		cotizacionesPorEstado,
		ingresosPorMes,
		cotizacionesPorVencer,
		topClientes,
		tendenciaCobrado
	};
};
