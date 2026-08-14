<script>
	import { page } from '$app/stores';
	import { aiContext } from '$lib/ai/context.svelte.js';

	let abierto = $state(false);
	let mensaje = $state('');
	let mensajes = $state([]);
	let cargando = $state(false);
	let error = $state('');

	const sugerencias = [
		'Qué puedo hacer aquí',
		'Cómo crear un cliente',
		'Cómo hacer una cotización',
		'Ver reporte de cobranza'
	];

	const ruta = $derived($page.url.pathname);

	function alternar() {
		abierto = !abierto;
	}

	function enviar(texto = mensaje) {
		const contenido = String(texto).trim();
		if (!contenido) return;

		mensajes = [...mensajes, { role: 'user', content: contenido }];
		mensaje = '';
		cargando = true;
		error = '';

		fetch('/api/ai', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				message: contenido,
				context: {
					path: ruta,
					page: aiContext.page,
					data: aiContext.data,
					summary: aiContext.summary
				}
			})
		})
			.then(async (res) => {
				const json = await res.json();
				if (!res.ok) throw new Error(json.error || json.message || 'Error al contactar al asistente');
				mensajes = [...mensajes, { role: 'assistant', content: json.respuesta }];
			})
			.catch((e) => {
				error = e.message;
			})
			.finally(() => {
				cargando = false;
			});
	}

	function sugerir(texto) {
		mensaje = texto;
		enviar(texto);
	}

	function alPresionarTecla(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			enviar();
		}
	}
</script>

{#if abierto}
	<div
		class="fixed bottom-20 right-4 z-50 flex w-96 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl"
	>
		<div class="flex items-center justify-between rounded-t-2xl bg-amber-500 px-4 py-3 text-white">
			<div class="flex items-center gap-2">
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 2a10 10 0 1 0 10 10H12V2z" />
					<path d="M12 12 2.1 9.9" />
					<path d="M12 12v9.9" />
				</svg>
				<span class="font-semibold">Aquila Asistente</span>
			</div>
			<button onclick={alternar} class="rounded p-1 hover:bg-amber-600" aria-label="Cerrar asistente">
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="flex h-80 flex-col gap-3 overflow-y-auto p-4">
			{#if mensajes.length === 0}
				<p class="text-sm text-gray-600">
					Hola, soy tu asistente en Aquila360. Pregúntame lo que necesites sobre la app o elige una sugerencia.
				</p>
			{/if}

			{#each mensajes as m (m)}
				<div class="flex flex-col gap-1">
					<div
						class="max-w-[85%] rounded-2xl px-4 py-2 text-sm {m.role === 'user'
							? 'self-end rounded-br-none bg-gray-900 text-white'
							: 'self-start rounded-bl-none bg-gray-100 text-gray-900'}"
					>
						{m.content}
					</div>
				</div>
			{/each}

			{#if error}
				<p class="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p>
			{/if}

			{#if cargando}
				<div class="self-start rounded-2xl rounded-bl-none bg-gray-100 px-4 py-2 text-sm text-gray-600">
					Escribiendo…
				</div>
			{/if}
		</div>

		<div class="border-t border-gray-100 p-3">
			<div class="mb-2 flex flex-wrap gap-2">
				{#each sugerencias as sugerencia}
					<button
						onclick={() => sugerir(sugerencia)}
						class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700 transition hover:bg-amber-100"
					>
						{sugerencia}
					</button>
				{/each}
			</div>
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={mensaje}
					onkeydown={alPresionarTecla}
					placeholder="Escribe tu pregunta…"
					class="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
				/>
				<button
					onclick={() => enviar()}
					disabled={cargando || !mensaje.trim()}
					class="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
				>
					Enviar
				</button>
			</div>
		</div>
	</div>
{/if}

<button
	onclick={alternar}
	class="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-2xl transition hover:bg-amber-600"
	aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente'}
>
	<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		{#if abierto}
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		{:else}
			<path d="M12 2a10 10 0 1 0 10 10H12V2z" />
			<path d="M12 12 2.1 9.9" />
			<path d="M12 12v9.9" />
		{/if}
	</svg>
</button>
