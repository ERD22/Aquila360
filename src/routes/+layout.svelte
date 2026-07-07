<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ClerkProvider, Show, UserButton } from 'svelte-clerk';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Aquila360</title>
</svelte:head>

<ClerkProvider>
	<Show when="signed-in">
		<nav class="border-b border-gray-200 bg-white">
			<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
				<div class="flex items-center gap-6">
					<a href="/dashboard" class="text-lg font-semibold text-gray-900">Aquila360</a>
					<div class="flex items-center gap-4 text-sm">
						<a href="/dashboard" class="text-gray-600 transition hover:text-gray-900">Dashboard</a>
						<a href="/clientes" class="text-gray-600 transition hover:text-gray-900">Clientes</a>
						<a href="/cobranza" class="text-gray-600 transition hover:text-gray-900">Cobranza</a>
					</div>
				</div>
				<UserButton />
			</div>
		</nav>
	</Show>

	{@render children()}
</ClerkProvider>
