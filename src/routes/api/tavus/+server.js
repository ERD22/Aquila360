import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const PAL_ID = 'pa50349a3ec9';

export const POST = async ({ locals }) => {
	const { userId } = locals.auth();
	if (!userId) {
		throw error(401, 'No autorizado');
	}

	const apiKey = (env.TAVUS_API_KEY || '').replace(/^["']|["']$/g, '').trim();
	if (!apiKey) {
		throw error(500, 'Falta TAVUS_API_KEY en el entorno.');
	}

	try {
		const respuesta = await fetch('https://tavusapi.com/v2/conversations', {
			method: 'POST',
			headers: {
				'x-api-key': apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				pal_id: PAL_ID,
				conversation_name: 'Asistente Aquila360',
				properties: {
					language: 'spanish',
					enable_recording: false
				}
			})
		});

		if (!respuesta.ok) {
			const detalle = await respuesta.text();
			console.error('Error Tavus:', respuesta.status, detalle);
			throw error(502, 'Tavus no pudo crear la conversacion.');
		}

		const datos = await respuesta.json();

		return json({
			conversationUrl: datos.conversation_url,
			conversationId: datos.conversation_id
		});
	} catch (err) {
		if (err.status) throw err;
		console.error('Error Tavus:', err);
		throw error(500, 'No se pudo iniciar el asistente en video.');
	}
};

export const DELETE = async ({ request, locals }) => {
	const { userId } = locals.auth();
	if (!userId) {
		throw error(401, 'No autorizado');
	}

	const apiKey = (env.TAVUS_API_KEY || '').replace(/^["']|["']$/g, '').trim();
	if (!apiKey) {
		throw error(500, 'Falta TAVUS_API_KEY en el entorno.');
	}

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Cuerpo de la peticion invalido');
	}

	const conversationId = String(body?.conversationId ?? '').trim();
	if (!conversationId) {
		throw error(400, 'Falta conversationId');
	}

	try {
		await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
			method: 'POST',
			headers: { 'x-api-key': apiKey }
		});
		return json({ ok: true });
	} catch (err) {
		console.error('Error al terminar conversacion Tavus:', err);
		return json({ ok: false });
	}
};

