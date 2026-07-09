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

	function diasBadgeClases(alerta) {
		switch (alerta) {
			case 'vencida':
				return 'bg-red-100 text-red-800';
			case 'atencion':
				return 'bg-amber-100 text-amber-800';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function filaClases(alerta) {
		switch (alerta) {
			case 'vencida':
				return 'bg-red-50';
			case 'atencion':
				return 'bg-amber-50';
			default:
				return '';
		}
	}
</script>

<main class="mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold text-gray-900">Cobranza</h1>
		<p class="mt-1 text-gray-600">Cuentas por cobrar ordenadas por antigüedad.</p>
	</div>

	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<p class="text-xs uppercase tracking-wide text-gray-500">Cartera pendiente total</p>
			<p class="mt-1 text-2xl font-semibold text-gray-900">
				{formatMoney(data.resumen.carteraPendienteTotal)}
			</p>
			<p class="mt-0.5 text-xs text-gray-400">MXN</p>
		</div>
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<p class="text-xs uppercase tracking-wide text-gray-500">Cartera vencida (+30 días)</p>
			<p class="mt-1 text-2xl font-semibold {data.resumen.carteraVencida > 0 ? 'text-red-600' : 'text-gray-900'}">
				{formatMoney(data.resumen.carteraVencida)}
			</p>
			<p class="mt-0.5 text-xs text-gray-400">MXN</p>
		</div>
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<p class="text-xs uppercase tracking-wide text-gray-500">Cuentas por cobrar</p>
			<p class="mt-1 text-2xl font-semibold text-gray-900">{data.resumen.total}</p>
			<p class="mt-0.5 text-xs text-gray-400">cotizaciones activas</p>
		</div>
	</div>

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		{#if data.cuentas.length === 0}
			<div class="py-8 text-center">
				<p class="text-lg font-medium text-gray-900">¡Todo al corriente!</p>
				<p class="mt-1 text-gray-600">
					No hay cotizaciones aprobadas ni facturadas con saldo pendiente. Cuando surjan pagos por
					registrar, aparecerán aquí.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 text-gray-600">
						<tr>
							<th class="py-3 pr-4 font-medium">Cliente</th>
							<th class="py-3 pr-4 font-medium">Número</th>
							<th class="py-3 pr-4 font-medium">Fecha</th>
							<th class="py-3 pr-4 font-medium">Total</th>
							<th class="py-3 pr-4 font-medium">Pagado</th>
							<th class="py-3 pr-4 font-medium">Pendiente</th>
							<th class="py-3 pr-4 font-medium">Días</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.cuentas as cuenta (cuenta.id)}
							<tr class="text-gray-900 {filaClases(cuenta.alerta)}">
								<td class="py-3 pr-4">
									<span class="font-medium">{cuenta.cliente?.nombre ?? '-'}</span>
									{#if cuenta.cliente?.empresa}
										<span class="block text-xs text-gray-500">{cuenta.cliente.empresa}</span>
									{/if}
								</td>
								<td class="py-3 pr-4 font-medium">
									<a
										href="/cotizaciones/{cuenta.id}"
										class="text-gray-900 transition hover:text-gray-600"
									>
										{cuenta.numero}
									</a>
								</td>
								<td class="py-3 pr-4">{formatDate(cuenta.fecha)}</td>
								<td class="py-3 pr-4">{formatMoney(cuenta.total)}</td>
								<td class="py-3 pr-4">{formatMoney(cuenta.pagado)}</td>
								<td class="py-3 pr-4 font-medium">{formatMoney(cuenta.saldoPendiente)}</td>
								<td class="py-3 pr-4">
									<span
										class="rounded-full px-2.5 py-1 text-xs font-medium {diasBadgeClases(cuenta.alerta)}"
									>
										{cuenta.diasTranscurridos}d
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</main>
