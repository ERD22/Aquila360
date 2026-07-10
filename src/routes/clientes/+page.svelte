<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let busqueda = $state('');

	const clientesFiltrados = $derived(
		busqueda.trim() === ''
			? data.clientes
			: data.clientes.filter((c) => {
					const texto = busqueda.toLowerCase();
					return (
						c.nombre?.toLowerCase().includes(texto) ||
						c.empresa?.toLowerCase().includes(texto) ||
						c.rfc?.toLowerCase().includes(texto)
					);
				})
	);

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
		<div class="mb-4 flex flex-col gap-3">
			<div class="flex items-center gap-2 border-b border-gray-200 pb-3">
				<a
					href="/clientes"
					class="rounded-lg px-4 py-1.5 text-sm font-medium transition
						{!data.mostrandoInactivos
							? 'bg-gray-900 text-white'
							: 'text-gray-600 hover:bg-gray-100'}"
				>
					Activos
				</a>
				<a
					href="/clientes?inactivos=1"
					class="rounded-lg px-4 py-1.5 text-sm font-medium transition
						{data.mostrandoInactivos
							? 'bg-gray-900 text-white'
							: 'text-gray-600 hover:bg-gray-100'}"
				>
					Inactivos
				</a>
			</div>
			<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<h2 class="text-lg font-medium text-gray-900">
					{data.mostrandoInactivos ? 'Clientes inactivos' : 'Clientes activos'}
				</h2>
				<form method="GET" class="flex items-center gap-2">
					{#if data.mostrandoInactivos}
						<input type="hidden" name="inactivos" value="1" />
					{/if}
					<input
						name="buscar"
						bind:value={busqueda}
						type="text"
						placeholder="Buscar por nombre, empresa o RFC…"
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
					/>
					<button
						type="submit"
						class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
					>
						Buscar
					</button>
					{#if data.buscar}
						<a
							href={data.mostrandoInactivos ? '/clientes?inactivos=1' : '/clientes'}
							class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						>
							Limpiar
						</a>
					{/if}
				</form>
			</div>
		</div>

		{#if clientesFiltrados.length === 0}
			{#if busqueda.trim()}
				<p class="text-gray-600">
					No encontramos clientes con ese criterio. Prueba con otro término.
				</p>
			{:else if data.mostrandoInactivos}
				<p class="text-gray-600">No hay clientes inactivos.</p>
			{:else}
				<p class="text-gray-600">
					Aún no hay clientes registrados. Agrega el primero usando el formulario de arriba.
				</p>
			{/if}
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
						{#each clientesFiltrados as cliente (cliente.id)}
							<tr class="text-gray-900">
								<td class="py-3 pr-4">
									<a
										href="/clientes/{cliente.id}"
										class="font-medium text-gray-900 transition hover:text-gray-600"
									>
										{cliente.nombre}
									</a>
								</td>
								<td class="py-3 pr-4">{cliente.empresa ?? '-'}</td>
								<td class="py-3 pr-4">{cliente.rfc ?? '-'}</td>
								<td class="py-3 pr-4">{cliente.telefono ?? '-'}</td>
								<td class="py-3 pr-4">{cliente.correo}</td>
								<td class="py-3 pr-4">{formatDate(cliente.creadoEn)}</td>
					<td class="py-3 pr-4">
						<div class="flex items-center gap-3">
							{#if !data.mostrandoInactivos}
								<a
									href="/clientes/{cliente.id}/editar"
									class="text-sm font-medium text-gray-900 transition hover:text-gray-600"
								>
									Editar
								</a>
								<form method="POST" action="?/desactivar"> 
									<input type="hidden" name="id" value={cliente.id} />
									<button
										type="submit"
										class="text-sm font-medium text-red-600 transition hover:text-red-800"
									>
										Desactivar
									</button>
								</form>
							{:else}
								<form method="POST" action="?/reactivar">
									<input type="hidden" name="id" value={cliente.id} />
									<button
										type="submit"
										class="text-sm font-medium text-green-700 transition hover:text-green-900"
									>
										Reactivar
									</button>
								</form>
							{/if}
						</div>
					</td>
				</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p class="text-sm text-gray-600">
					Página {data.pagina} de {data.totalPaginas} ({data.total} clientes)
				</p>
				<div class="flex items-center gap-2">
					{#if data.pagina > 1}
						<a
							href="?buscar={data.buscar}&pagina={data.pagina - 1}"
							class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						>
							← Anterior
						</a>
					{/if}
					{#if data.pagina < data.totalPaginas}
						<a
							href="?buscar={data.buscar}&pagina={data.pagina + 1}"
							class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						>
							Siguiente →
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</section>
</main>
