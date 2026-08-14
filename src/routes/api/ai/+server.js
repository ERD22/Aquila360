import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import Anthropic from '@anthropic-ai/sdk';
import systemPrompt from '$lib/ai/system-prompt.md?raw';

export const POST = async ({ request, locals }) => {
	const { userId } = locals.auth();
	if (!userId) {
		throw error(401, 'No autorizado');
	}

	const apiKey = (env.ANTHROPIC_API_KEY || '').replace(/^["']|["']$/g, '').trim();
	if (!apiKey) {
		throw error(500, 'El asistente no está configurado. Falta ANTHROPIC_API_KEY en el entorno.');
	}

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Cuerpo de la petición inválido');
	}

	const message = String(body?.message ?? '').trim();
	if (!message) {
		throw error(400, 'El mensaje está vacío');
	}

	const context = body?.context ?? {};
	const contextText = JSON.stringify(context, null, 2);

	const client = new Anthropic({ apiKey });
	const model = (env.CLAUDE_MODEL || 'claude-3-haiku-20240307')
		.replace(/^["']|["']$/g, '')
		.trim();

	try {
		const response = await client.messages.create({
			model,
			max_tokens: 1024,
			system: `${systemPrompt}\n\nContexto actual de la app (ruta y datos disponibles):\n${contextText}`,
			messages: [{ role: 'user', content: message }]
		});

		const respuesta = response.content
			.filter((c) => c.type === 'text')
			.map((c) => c.text)
			.join('\n');

		return json({ respuesta });
	} catch (err) {
		console.error('Error Anthropic:', err);
		throw error(500, 'No se pudo obtener una respuesta del asistente.');
	}
};
