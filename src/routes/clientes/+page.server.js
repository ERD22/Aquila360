import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

const POR_PAGINA = 20;

export const load = async ({ url, locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const buscar = String(url.searchParams.get('buscar') ?? '').trim();
	const pagina = Math.max(1, parseInt(url.searchParams.get('pagina') ?? '1', 10) || 1);

	const where = {
		activo: true,
		...(buscar
			? {
					OR: [
						{ nombre: { contains: buscar, mode: 'insensitive' } },
						{ empresa: { contains: buscar, mode: 'insensitive' } },
						{ rfc: { contains: buscar, mode: 'insensitive' } }
					]
				}
			: {})
	};

	const [clientes, total] = await Promise.all([
		prisma.cliente.findMany({
			where,
			orderBy: { creadoEn: 'desc' },
			skip: (pagina - 1) * POR_PAGINA,
			take: POR_PAGINA
		}),
		prisma.cliente.count({ where })
	]);

	const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

	return { clientes, buscar, pagina, totalPaginas, total };
};

export const actions = {
	crear: async ({ request, locals }) => {
		const { userId } = locals.auth();

		if (!userId) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const nombre = String(formData.get('nombre') ?? '').trim();
		const empresa = String(formData.get('empresa') ?? '').trim() || null;
		const rfc = String(formData.get('rfc') ?? '').trim() || null;
		const correo = String(formData.get('correo') ?? '').trim();
		const telefono = String(formData.get('telefono') ?? '').trim() || null;
		const direccion = String(formData.get('direccion') ?? '').trim() || null;
		const notas = String(formData.get('notas') ?? '').trim() || null;

		const errores = {};

		if (!nombre) {
			errores.nombre = 'El nombre es obligatorio.';
		}

		if (!correo) {
			errores.correo = 'El correo es obligatorio.';
		}

		if (rfc && !/^[A-Za-z0-9]{12,13}$/.test(rfc)) {
			errores.rfc = 'El RFC debe tener 12 o 13 caracteres alfanuméricos.';
		}

		if (Object.keys(errores).length > 0) {
			return fail(400, {
				errores,
				valores: { nombre, empresa, rfc, correo, telefono, direccion, notas }
			});
		}

		await prisma.cliente.create({
			data: { nombre, empresa, rfc, correo, telefono, direccion, notas }
		});

		return { exito: true };
	},

	desactivar: async ({ request, locals }) => {
		const { userId } = locals.auth();

		if (!userId) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();

		if (!id) {
			return fail(400, { error: 'Falta el id del cliente.' });
		}

		await prisma.cliente.update({
			where: { id },
			data: { activo: false }
		});

		return { exito: true };
	}
};
