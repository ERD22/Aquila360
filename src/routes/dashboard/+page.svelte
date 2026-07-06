<script>
	import { UserButton } from 'svelte-clerk/client';

	let { data } = $props();
	const user = data.user;
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6">
	<div class="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-sm">
		<h1 class="text-2xl font-semibold text-gray-900">
			Bienvenido, {user?.firstName ?? 'Usuario'}
		</h1>
		<UserButton />
	</div>
</main>
