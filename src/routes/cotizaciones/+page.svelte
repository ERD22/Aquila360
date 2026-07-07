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

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		{#if data.cotizaciones.length === 0}
			<p class="text-gray-600">
				Aún no tienes cotizaciones. Cuando empieces a cotizar a tus clientes, aquí verás el
				historial completo.
			</p>
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
