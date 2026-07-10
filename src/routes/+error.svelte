<script>
	import { page } from '$app/stores';
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
	<div class="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
		<svg class="mx-auto mb-4 h-12 w-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
		</svg>

		<h1 class="text-2xl font-semibold text-gray-900">
			{$page.status === 404 ? 'Página no encontrada' : 'Algo salió mal'}
		</h1>

		<p class="mt-2 text-sm text-gray-600">
			{#if $page.status === 404}
				La página que buscas no existe o fue movida.
			{:else}
				Tuvimos un problema al procesar tu solicitud. Intenta de nuevo en unos momentos.
			{/if}
		</p>

		<p class="mt-4 text-xs text-gray-400">Error {$page.status}</p>

		<div class="mt-6 flex flex-col gap-2">
			<a href="/dashboard" class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
				Ir al dashboard
			</a>
			<button onclick={() => location.reload()} class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
				Reintentar
			</button>
		</div>
	</div>
</main>