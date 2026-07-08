import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load = async ({ params, locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		redirect(303, '/');
	}

	const cliente = await prisma.cliente.findUnique({
		where: { id: params.id }
	});

	if (!cliente) {
		error(404, 'Cliente no encontrado.');
	}

	return { cliente };
};

export const actions = {
	default: async ({ params, request, locals }) => {
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

		await prisma.cliente.update({
			where: { id: params.id },
			data: { nombre, empresa, rfc, correo, telefono, direccion, notas }
		});

		redirect(303, '/clientes');
	}
};
