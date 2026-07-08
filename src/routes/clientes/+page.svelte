<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function formatDate(date) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('es-MX', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
</script>

<main class="mx-auto max-w-6xl p-6">
	<h1 class="mb-6 text-2xl font-semibold text-gray-900">Gestión de clientes</h1>

	<section class="mb-8 rounded-2xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-medium text-gray-900">Agregar cliente</h2>

		{#if form?.exito}
			<p class="mb-4 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-800">
				Cliente creado correctamente.
			</p>
		{/if}

		<form method="POST" action="?/crear" use:enhance class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label for="nombre" class="text-sm font-medium text-gray-700">Nombre *</label>
				<input
					id="nombre"
					name="nombre"
					type="text"
					required
					value={form?.valores?.nombre ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
				{#if form?.errores?.nombre}
					<span class="text-sm text-red-600">{form.errores.nombre}</span>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label for="empresa" class="text-sm font-medium text-gray-700">Empresa</label>
				<input
					id="empresa"
					name="empresa"
					type="text"
					value={form?.valores?.empresa ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="rfc" class="text-sm font-medium text-gray-700">RFC</label>
				<input
					id="rfc"
					name="rfc"
					type="text"
					value={form?.valores?.rfc ?? ''}
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
					value={form?.valores?.correo ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
				{#if form?.errores?.correo}
					<span class="text-sm text-red-600">{form.errores.correo}</span>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label for="telefono" class="text-sm font-medium text-gray-700">Teléfono</label>
				<input
					id="telefono"
					name="telefono"
					type="tel"
					value={form?.valores?.telefono ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="direccion" class="text-sm font-medium text-gray-700">Dirección</label>
				<input
					id="direccion"
					name="direccion"
					type="text"
					value={form?.valores?.direccion ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1 md:col-span-2">
				<label for="notas" class="text-sm font-medium text-gray-700">Notas</label>
				<textarea
					id="notas"
					name="notas"
					rows="3"
					value={form?.valores?.notas ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				></textarea>
			</div>

			<div class="md:col-span-2">
				<button
					type="submit"
					class="rounded-lg bg-gray-900 px-5 py-2.5 text-white transition hover:bg-gray-800"
				>
					Guardar cliente
				</button>
			</div>
		</form>
	</section>

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-medium text-gray-900">Clientes activos</h2>

		{#if data.clientes.length === 0}
			<p class="text-gray-600">
				Aún no hay clientes registrados. Agrega el primero usando el formulario de arriba.
			</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 text-gray-600">
						<tr>
							<th class="py-3 pr-4 font-medium">Nombre</th>
							<th class="py-3 pr-4 font-medium">Empresa</th>
							<th class="py-3 pr-4 font-medium">RFC</th>
							<th class="py-3 pr-4 font-medium">Teléfono</th>
							<th class="py-3 pr-4 font-medium">Correo</th>
							<th class="py-3 pr-4 font-medium">Fecha de alta</th>
							<th class="py-3 pr-4 font-medium">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.clientes as cliente (cliente.id)}
							<tr class="text-gray-900">
								<td class="py-3 pr-4">{cliente.nombre}</td>
								<td class="py-3 pr-4">{cliente.empresa ?? '-'}</td>
								<td class="py-3 pr-4">{cliente.rfc ?? '-'}</td>
								<td class="py-3 pr-4">{cliente.telefono ?? '-'}</td>
								<td class="py-3 pr-4">{cliente.correo}</td>
								<td class="py-3 pr-4">{formatDate(cliente.creadoEn)}</td>
								<td class="py-3 pr-4">
									<div class="flex items-center gap-3">
										<a
											href="/clientes/{cliente.id}"
											class="text-sm font-medium text-gray-900 transition hover:text-gray-600"
										>
											Editar
										</a>
										<form method="POST" action="?/desactivar" use:enhance>
											<input type="hidden" name="id" value={cliente.id} />
											<button
												type="submit"
												class="text-sm font-medium text-red-600 transition hover:text-red-800"
											>
												Desactivar
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</main>
