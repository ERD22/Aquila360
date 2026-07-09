<script>
	let { data } = $props();

	function formatMoney(value) {
		const number = Number(value ?? 0);
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2
		}).format(number);
	}

	function formatDate(date) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('es-MX', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function badgeClasses(estado) {
		switch (estado) {
			case 'APROBADA':
				return 'bg-green-100 text-green-800';
			case 'ENVIADA':
				return 'bg-blue-100 text-blue-800';
			case 'FACTURADA':
				return 'bg-purple-100 text-purple-800';
			case 'PAGADA':
				return 'bg-emerald-100 text-emerald-800';
			case 'RECHAZADA':
				return 'bg-red-100 text-red-800';
			case 'BORRADOR':
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function badgeLabel(estado) {
		const labels = {
			BORRADOR: 'Borrador',
			ENVIADA: 'Enviada',
			APROBADA: 'Aprobada',
			RECHAZADA: 'Rechazada',
			FACTURADA: 'Facturada',
			PAGADA: 'Pagada'
		};
		return labels[estado] ?? estado;
	}
</script>

<main class="mx-auto max-w-6xl p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-gray-900">Cotizaciones</h1>
		<a
			href="/cotizaciones/nueva"
			class="rounded-lg bg-gray-900 px-5 py-2.5 text-white transition hover:bg-gray-800"
		>
			Nueva cotización
		</a>
	</div>

	<section class="mb-4 rounded-2xl bg-white p-6 shadow-sm">
		<form method="GET" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div class="flex flex-col gap-1">
				<label for="estado" class="text-xs font-medium uppercase tracking-wide text-gray-500"
					>Estado</label
				>
				<select
					id="estado"
					name="estado"
					class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
				>
					<option value="" selected={!data.filtros.estado}>Todos los estados</option>
					<option value="BORRADOR" selected={data.filtros.estado === 'BORRADOR'}>Borrador</option>
					<option value="ENVIADA" selected={data.filtros.estado === 'ENVIADA'}>Enviada</option>
					<option value="APROBADA" selected={data.filtros.estado === 'APROBADA'}>Aprobada</option>
					<option value="RECHAZADA" selected={data.filtros.estado === 'RECHAZADA'}>Rechazada</option>
					<option value="FACTURADA" selected={data.filtros.estado === 'FACTURADA'}>Facturada</option>
					<option value="PAGADA" selected={data.filtros.estado === 'PAGADA'}>Pagada</option>
				</select>
			</div>

			<div class="flex flex-col gap-1">
				<label for="clienteId" class="text-xs font-medium uppercase tracking-wide text-gray-500"
					>Cliente</label
				>
				<select
					id="clienteId"
					name="clienteId"
					class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
				>
					<option value="" selected={!data.filtros.clienteId}>Todos los clientes</option>
					{#each data.clientes as cliente (cliente.id)}
						<option value={cliente.id} selected={data.filtros.clienteId === cliente.id}>
							{cliente.nombre}{cliente.empresa ? ` — ${cliente.empresa}` : ''}
						</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-1">
				<label for="desde" class="text-xs font-medium uppercase tracking-wide text-gray-500"
					>Desde</label
				>
				<input
					id="desde"
					name="desde"
					type="date"
					value={data.filtros.desde}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="hasta" class="text-xs font-medium uppercase tracking-wide text-gray-500"
					>Hasta</label
				>
				<input
					id="hasta"
					name="hasta"
					type="date"
					value={data.filtros.hasta}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
				/>
			</div>

			<div class="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
				<button
					type="submit"
					class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
				>
					Aplicar filtros
				</button>
				{#if data.filtros.estado || data.filtros.clienteId || data.filtros.desde || data.filtros.hasta}
					<a
						href="/cotizaciones"
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						Limpiar
					</a>
				{/if}
			</div>
		</form>
	</section>

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		{#if data.cotizaciones.length === 0}
			{#if data.filtros.estado || data.filtros.clienteId || data.filtros.desde || data.filtros.hasta}
				<p class="text-gray-600">No hay cotizaciones que coincidan con estos filtros.</p>
			{:else}
				<p class="text-gray-600">
					Aún no tienes cotizaciones. Cuando empieces a cotizar a tus clientes, aquí verás el
					historial completo.
				</p>
			{/if}
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 text-gray-600">
						<tr>
							<th class="py-3 pr-4 font-medium">Número</th>
							<th class="py-3 pr-4 font-medium">Cliente</th>
							<th class="py-3 pr-4 font-medium">Estado</th>
							<th class="py-3 pr-4 font-medium">Total</th>
							<th class="py-3 pr-4 font-medium">Fecha</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.cotizaciones as cotizacion (cotizacion.id)}
							<tr class="text-gray-900">
								<td class="py-3 pr-4 font-medium">
									<a
										href="/cotizaciones/{cotizacion.id}"
										class="text-gray-900 transition hover:text-gray-600"
									>
										{cotizacion.numero}
									</a>
								</td>
								<td class="py-3 pr-4">{cotizacion.cliente?.nombre ?? '-'}</td>
								<td class="py-3 pr-4">
									<span
										class="rounded-full px-2.5 py-1 text-xs font-medium {badgeClasses(
											cotizacion.estado
										)}"
									>
										{badgeLabel(cotizacion.estado)}
									</span>
								</td>
								<td class="py-3 pr-4">{formatMoney(cotizacion.total)}</td>
								<td class="py-3 pr-4">{formatDate(cotizacion.fecha)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</main>
