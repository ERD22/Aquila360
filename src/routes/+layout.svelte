<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ClerkProvider, Show, UserButton } from 'svelte-clerk';

	let { children } = $props();

	let menuAbierto = $state(false);

	function toggleMenu() {
		menuAbierto = !menuAbierto;
	}

	function cerrarMenu() {
		menuAbierto = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Aquila360</title>
</svelte:head>

<ClerkProvider>
	<Show when="signed-in">
		<nav class="border-b border-gray-200 bg-white">
			<div class="mx-auto max-w-6xl px-6 py-3">
				<div class="flex items-center justify-between">
					<a href="/dashboard" class="text-lg font-semibold text-gray-900">Aquila360</a>

					<div class="hidden items-center gap-4 text-sm md:flex">
						<a href="/dashboard" class="text-gray-600 transition hover:text-gray-900">Dashboard</a>
						<a href="/clientes" class="text-gray-600 transition hover:text-gray-900">Clientes</a>
						<a href="/cotizaciones" class="text-gray-600 transition hover:text-gray-900">Cotizaciones</a>
						<a href="/cobranza" class="text-gray-600 transition hover:text-gray-900">Cobranza</a>
					</div>

					<div class="flex items-center gap-3">
						<UserButton />
						<button onclick={toggleMenu} class="text-gray-700 md:hidden" aria-label="Abrir menú">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								{#if menuAbierto}
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								{:else}
									<line x1="3" y1="12" x2="21" y2="12"></line>
									<line x1="3" y1="6" x2="21" y2="6"></line>
									<line x1="3" y1="18" x2="21" y2="18"></line>
								{/if}
							</svg>
						</button>
					</div>
				</div>

				{#if menuAbierto}
					<div class="mt-3 flex flex-col gap-2 text-sm md:hidden">
						<a href="/dashboard" onclick={cerrarMenu} class="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100">Dashboard</a>
						<a href="/clientes" onclick={cerrarMenu} class="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100">Clientes</a>
						<a href="/cotizaciones" onclick={cerrarMenu} class="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100">Cotizaciones</a>
						<a href="/cobranza" onclick={cerrarMenu} class="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100">Cobranza</a>
					</div>
				{/if}
			</div>
		</nav>
	</Show>

	{@render children()}
</ClerkProvider>
