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
					<a href="/dashboard" class="flex items-center gap-2.5">
						<svg class="h-7 w-7 text-amber-500" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
							<path d="M32 12 L32 46" />
							<path d="M32 16 C 22 18, 12 24, 6 34 C 16 32, 24 30, 32 30" />
							<path d="M32 16 C 42 18, 52 24, 58 34 C 48 32, 40 30, 32 30" />
							<path d="M32 30 C 26 34, 22 40, 20 48 C 26 44, 30 42, 32 42" />
							<path d="M32 30 C 38 34, 42 40, 44 48 C 38 44, 34 42, 32 42" />
							<path d="M32 42 L32 52" />
							<circle cx="32" cy="10" r="2.5" fill="currentColor" />
						</svg>
						<span class="text-lg font-bold tracking-tight text-gray-900">Aquila<span class="text-amber-500">360</span></span>
					</a>

					<div class="hidden items-center gap-5 text-sm md:flex">
						<a href="/dashboard" class="font-medium text-gray-600 transition hover:text-amber-600">Dashboard</a>
						<a href="/clientes" class="font-medium text-gray-600 transition hover:text-amber-600">Clientes</a>
						<a href="/cotizaciones" class="font-medium text-gray-600 transition hover:text-amber-600">Cotizaciones</a>
						<a href="/cobranza" class="font-medium text-gray-600 transition hover:text-amber-600">Cobranza</a>
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
						<a href="/dashboard" onclick={cerrarMenu} class="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-700">Dashboard</a>
						<a href="/clientes" onclick={cerrarMenu} class="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-700">Clientes</a>
						<a href="/cotizaciones" onclick={cerrarMenu} class="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-700">Cotizaciones</a>
						<a href="/cobranza" onclick={cerrarMenu} class="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-700">Cobranza</a>
					</div>
				{/if}
			</div>
		</nav>
	</Show>

	{@render children()}
</ClerkProvider>