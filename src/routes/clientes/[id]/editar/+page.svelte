<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	const cliente = data.cliente;
</script>

<main class="mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<a href="/clientes/{cliente.id}" class="text-sm text-gray-600 transition hover:text-gray-900">
			← Volver al perfil
		</a>
	</div>

	<h1 class="mb-6 text-2xl font-semibold text-gray-900">Editar cliente</h1>

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		{#if form?.errores}
			<div class="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">
				{#if form.errores.nombre}
					<p>{form.errores.nombre}</p>
				{/if}
				{#if form.errores.correo}
					<p>{form.errores.correo}</p>
				{/if}
				{#if form.errores.rfc}
					<p>{form.errores.rfc}</p>
				{/if}
			</div>
		{/if}

		<form method="POST" use:enhance class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label for="nombre" class="text-sm font-medium text-gray-700">Nombre *</label>
				<input
					id="nombre"
					name="nombre"
					type="text"
					required
					value={form?.valores?.nombre ?? cliente.nombre}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="empresa" class="text-sm font-medium text-gray-700">Empresa</label>
				<input
					id="empresa"
					name="empresa"
					type="text"
					value={form?.valores?.empresa ?? cliente.empresa ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="rfc" class="text-sm font-medium text-gray-700">RFC</label>
				<input
					id="rfc"
					name="rfc"
					type="text"
					value={form?.valores?.rfc ?? cliente.rfc ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
				{#if form?.errores?.rfc}
					<span class="text-sm text-red-600">{form.errores.rfc}</span>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label for="correo" class="text-sm font-medium text-gray-700">Correo *</label>
				<input
					id="correo"
					name="correo"
					type="email"
					required
					value={form?.valores?.correo ?? cliente.correo}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="telefono" class="text-sm font-medium text-gray-700">Teléfono</label>
				<input
					id="telefono"
					name="telefono"
					type="tel"
					value={form?.valores?.telefono ?? cliente.telefono ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="direccion" class="text-sm font-medium text-gray-700">Dirección</label>
				<input
					id="direccion"
					name="direccion"
					type="text"
					value={form?.valores?.direccion ?? cliente.direccion ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1 md:col-span-2">
				<label for="notas" class="text-sm font-medium text-gray-700">Notas</label>
				<textarea
					id="notas"
					name="notas"
					rows="3"
					value={form?.valores?.notas ?? cliente.notas ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				></textarea>
			</div>

			<div class="flex items-center gap-3 md:col-span-2">
				<button
					type="submit"
					class="rounded-lg bg-gray-900 px-5 py-2.5 text-white transition hover:bg-gray-800"
				>
					Guardar cambios
				</button>
				<a
					href="/clientes/{cliente.id}"
					class="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-50"
				>
					Cancelar
				</a>
			</div>
		</form>
	</section>
</main>
