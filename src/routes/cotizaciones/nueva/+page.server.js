import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const clientes = await prisma.cliente.findMany({
		where: { activo: true },
		orderBy: { nombre: 'asc' }
	});

	return { clientes };
};

export const actions = {
	default: async ({ request, locals }) => {
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
				valores: {
					clienteId,
					notas,
					vencimiento: vencimientoRaw,
					descripciones,
					cantidades,
					precios
				}
			});
		}

		const subtotalGeneral = conceptos.reduce((sum, c) => sum + c.subtotal, 0);
		const iva = subtotalGeneral * 0.16;
		const total = subtotalGeneral + iva;

		const ultima = await prisma.cotizacion.findFirst({
			orderBy: { numero: 'desc' }
		});
		const ultimoNumero = ultima ? parseInt(ultima.numero.replace('COT-', ''), 10) : 0;
		const numero = 'COT-' + String(ultimoNumero + 1).padStart(6, '0');

		await prisma.cotizacion.create({
			data: {
				numero,
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
		});

		redirect(303, '/cotizaciones');
	}
};
