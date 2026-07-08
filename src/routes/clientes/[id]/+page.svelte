<script>
	let { data } = $props();
	const { cliente, cotizaciones, totales } = data;

	function formatMoney(value) {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2
		}).format(Number(value ?? 0));
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
			case 'APROBADA': return 'bg-green-100 text-green-800';
			case 'ENVIADA': return 'bg-blue-100 text-blue-800';
			case 'FACTURADA': return 'bg-purple-100 text-purple-800';
			case 'PAGADA': return 'bg-emerald-100 text-emerald-800';
			case 'RECHAZADA': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-700';
		}
	}

	function badgeLabel(estado) {
		const labels = {
			BORRADOR: 'Borrador', ENVIADA: 'Enviada', APROBADA: 'Aprobada',
			RECHAZADA: 'Rechazada', FACTURADA: 'Facturada', PAGADA: 'Pagada'
		};
		return labels[estado] ?? estado;
	}
</script>

<main class="mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<a href="/clientes" class="text-sm text-gray-600 transition hover:text-gray-900">
			← Volver a clientes
		</a>
	</div>

	<section class="mb-6 rounded-2xl bg-white p-6 shadow-sm">
		<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
			<div>
				<h1 class="text-2xl font-semibold text-gray-900">{cliente.nombre}</h1>
				{#if cliente.empresa}
					<p class="mt-1 text-gray-600">{cliente.empresa}</p>
				{/if}
			</div>
			<a
				href="/clientes/{cliente.id}/editar"
				class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
			>
				Editar
			</a>
		</div>

		<div class="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2 lg:grid-cols-4">
			{#if cliente.correo}
				<div>
					<p class="text-xs uppercase tracking-wide text-gray-500">Correo</p>
					<p>{cliente.correo}</p>
				</div>
			{/if}
			{#if cliente.telefono}
				<div>
					<p class="text-xs uppercase tracking-wide text-gray-500">Teléfono</p>
					<p>{cliente.telefono}</p>
				</div>
			{/if}
			{#if cliente.rfc}
				<div>
					<p class="text-xs uppercase tracking-wide text-gray-500">RFC</p>
					<p>{cliente.rfc}</p>
				</div>
			{/if}
			{#if cliente.direccion}
				<div>
					<p class="text-xs uppercase tracking-wide text-gray-500">Dirección</p>
					<p>{cliente.direccion}</p>
				</div>
			{/if}
			{#if cliente.notas}
				<div class="md:col-span-2 lg:col-span-4">
					<p class="text-xs uppercase tracking-wide text-gray-500">Notas</p>
					<p>{cliente.notas}</p>
				</div>
			{/if}
		</div>
	</section>

	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<p class="text-xs font-medium uppercase tracking-wide text-gray-500">Total facturado</p>
			<p class="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(totales.totalFacturado)}</p>
		</div>
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<p class="text-xs font-medium uppercase tracking-wide text-gray-500">Total cobrado</p>
			<p class="mt-1 text-2xl font-semibold text-emerald-700">{formatMoney(totales.totalCobrado)}</p>
		</div>
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<p class="text-xs font-medium uppercase tracking-wide text-gray-500">Saldo pendiente</p>
			<p class="mt-1 text-2xl font-semibold text-amber-700">{formatMoney(totales.saldoPendiente)}</p>
		</div>
	</div>

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-medium text-gray-900">Cotizaciones</h2>

		{#if cotizaciones.length === 0}
			<div class="py-6 text-center">
				<p class="mb-3 text-gray-600">Este cliente aún no tiene cotizaciones.</p>
				<a
					href="/cotizaciones/nueva"
					class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
				>
					Crear cotización
				</a>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 text-gray-600">
						<tr>
							<th class="py-3 pr-4 font-medium">Número</th>
							<th class="py-3 pr-4 font-medium">Estado</th>
							<th class="py-3 pr-4 font-medium">Total</th>
							<th class="py-3 pr-4 font-medium">Pagado</th>
							<th class="py-3 pr-4 font-medium">Fecha</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each cotizaciones as cot (cot.id)}
							<tr class="text-gray-900">
								<td class="py-3 pr-4">
									<a
										href="/cotizaciones/{cot.id}"
										class="font-medium text-gray-900 transition hover:text-gray-600"
									>
										{cot.numero}
									</a>
								</td>
								<td class="py-3 pr-4">
									<span
										class="rounded-full px-2.5 py-0.5 text-xs font-medium {badgeClasses(cot.estado)}"
									>
										{badgeLabel(cot.estado)}
									</span>
								</td>
								<td class="py-3 pr-4">{formatMoney(cot.total)}</td>
								<td class="py-3 pr-4">{formatMoney(cot.pagado)}</td>
								<td class="py-3 pr-4">{formatDate(cot.creadoEn)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</main>
