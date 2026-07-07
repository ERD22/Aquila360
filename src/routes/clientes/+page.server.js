import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const clientes = await prisma.cliente.findMany({
		where: { activo: true },
		orderBy: { creadoEn: 'desc' }
	});

	return { clientes };
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
