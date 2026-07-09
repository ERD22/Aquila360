<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();
	const cotizacion = data.cotizacion;

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

	function formatDateTime(date) {
		if (!date) return '-';
		return new Date(date).toLocaleString('es-MX', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
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

	function transiciones(estado) {
		switch (estado) {
			case 'BORRADOR':
				return [{ estado: 'ENVIADA', label: 'Enviar cotización', tone: 'blue' }];
			case 'ENVIADA':
				return [
					{ estado: 'APROBADA', label: 'Aprobar', tone: 'green' },
					{ estado: 'RECHAZADA', label: 'Rechazar', tone: 'red' }
				];
			case 'APROBADA':
				return [{ estado: 'FACTURADA', label: 'Facturar', tone: 'purple' }];
			case 'FACTURADA':
				return [{ estado: 'PAGADA', label: 'Marcar pagada', tone: 'emerald' }];
			default:
				return [];
		}
	}

	function buttonTone(tone) {
		const classes = {
			blue: 'bg-blue-700 hover:bg-blue-800',
			green: 'bg-green-700 hover:bg-green-800',
			red: 'bg-red-700 hover:bg-red-800',
			purple: 'bg-purple-700 hover:bg-purple-800',
			emerald: 'bg-emerald-700 hover:bg-emerald-800'
		};
		return classes[tone] ?? 'bg-gray-900 hover:bg-gray-800';
	}

	function metodoLabel(metodo) {
		const labels = {
			TRANSFERENCIA: 'Transferencia',
			EFECTIVO: 'Efectivo',
			CHEQUE: 'Cheque',
			TARJETA: 'Tarjeta'
		};
		return labels[metodo] ?? metodo;
	}
</script>

<main class="mx-auto max-w-5xl p-6">
	<div class="mb-6">
		<a href="/cotizaciones" class="text-sm text-gray-600 transition hover:text-gray-900">
			← Volver a cotizaciones
		</a>
	</div>

	<section class="mb-6 rounded-2xl bg-white p-6 shadow-sm">
		<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
			<div>
				<h1 class="text-2xl font-semibold text-gray-900">Cotización {cotizacion.numero}</h1>
				<p class="mt-1 text-gray-600">
					{cotizacion.cliente?.nombre ?? 'Cliente no disponible'}
					{cotizacion.cliente?.empresa ? `— ${cotizacion.cliente.empresa}` : ''}
				</p>
			</div>
			<div class="flex items-center gap-3">
				<span
					class="rounded-full px-3 py-1 text-sm font-medium {badgeClasses(cotizacion.estado)}"
				>
					{badgeLabel(cotizacion.estado)}
				</span>
				{#if cotizacion.estado === 'BORRADOR'}
					<a
						href="/cotizaciones/{cotizacion.id}/editar"
						class="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						Editar
					</a>
				{/if}
			</div>
		</div>

		<div class="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
			<div>
				<p class="text-xs uppercase tracking-wide text-gray-500">Fecha de emisión</p>
				<p>{formatDate(cotizacion.fecha)}</p>
			</div>
			<div>
				<p class="text-xs uppercase tracking-wide text-gray-500">Vencimiento</p>
				<p>{formatDate(cotizacion.vencimiento)}</p>
			</div>
			{#if cotizacion.notas}
				<div class="md:col-span-3">
					<p class="text-xs uppercase tracking-wide text-gray-500">Notas</p>
					<p class="text-gray-800">{cotizacion.notas}</p>
				</div>
			{/if}
		</div>
	</section>

	<section class="mb-6 rounded-2xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-medium text-gray-900">Conceptos</h2>

		{#if cotizacion.conceptos.length === 0}
			<p class="text-gray-600">Esta cotización no tiene conceptos.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 text-gray-600">
						<tr>
							<th class="py-3 pr-4 font-medium">Descripción</th>
							<th class="py-3 pr-4 font-medium">Cantidad</th>
							<th class="py-3 pr-4 font-medium">Precio unitario</th>
							<th class="py-3 pr-4 font-medium">Subtotal</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each cotizacion.conceptos as concepto (concepto.id)}
							<tr class="text-gray-900">
								<td class="py-3 pr-4">{concepto.descripcion}</td>
								<td class="py-3 pr-4">{concepto.cantidad}</td>
								<td class="py-3 pr-4">{formatMoney(concepto.precioUnitario)}</td>
								<td class="py-3 pr-4">{formatMoney(concepto.subtotal)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<div class="mt-4 flex flex-col items-end gap-2 border-t border-gray-200 pt-4">
			<div class="flex w-full max-w-sm justify-between text-sm text-gray-600">
				<span>Subtotal</span>
				<span>{formatMoney(cotizacion.subtotal)}</span>
			</div>
			<div class="flex w-full max-w-sm justify-between text-sm text-gray-600">
				<span>IVA (16%)</span>
				<span>{formatMoney(cotizacion.iva)}</span>
			</div>
			<div class="flex w-full max-w-sm justify-between text-lg font-semibold text-gray-900">
				<span>Total</span>
				<span>{formatMoney(cotizacion.total)}</span>
			</div>
		</div>
	</section>

	<section class="mb-6 rounded-2xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-medium text-gray-900">Pagos</h2>

		<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="rounded-xl {data.saldo <= 0 ? 'bg-green-50' : 'bg-amber-50'} p-4">
				<p
					class="text-xs uppercase tracking-wide {data.saldo <= 0
						? 'text-green-700'
						: 'text-amber-700'}"
				>
					Saldo pendiente
				</p>
				<p
					class="mt-1 text-2xl font-semibold {data.saldo <= 0
						? 'text-green-800'
						: 'text-amber-800'}"
				>
					{formatMoney(data.saldo)}
				</p>
			</div>
			<div class="rounded-xl bg-gray-50 p-4">
				<p class="text-xs uppercase tracking-wide text-gray-600">Total pagado</p>
				<p class="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(data.totalPagado)}</p>
			</div>
			<div class="rounded-xl bg-gray-50 p-4">
				<p class="text-xs uppercase tracking-wide text-gray-600">Total de la cotización</p>
				<p class="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(cotizacion.total)}</p>
			</div>
		</div>

		{#if cotizacion.pagos.length === 0}
			<p class="text-gray-600">Aún no hay pagos registrados.</p>
		{:else}
			<div class="mb-6 overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 text-gray-600">
						<tr>
							<th class="py-3 pr-4 font-medium">Fecha</th>
							<th class="py-3 pr-4 font-medium">Monto</th>
							<th class="py-3 pr-4 font-medium">Método</th>
							<th class="py-3 pr-4 font-medium">Referencia</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each cotizacion.pagos as pago (pago.id)}
							<tr class="text-gray-900">
								<td class="py-3 pr-4">{formatDate(pago.fecha)}</td>
								<td class="py-3 pr-4">{formatMoney(pago.monto)}</td>
								<td class="py-3 pr-4">{metodoLabel(pago.metodo)}</td>
								<td class="py-3 pr-4">{pago.referencia ?? '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if data.saldo > 0}
			{#if form?.exitoPago}
				<p class="mb-4 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-800">
					Pago registrado correctamente.
				</p>
			{/if}

			{#if form?.error}
				<p class="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{form.error}</p>
			{/if}

			<form method="POST" action="?/registrarPago" class="grid grid-cols-1 gap-4 md:grid-cols-4">
				<div class="flex flex-col gap-1 md:col-span-1">
					<label for="monto" class="text-sm font-medium text-gray-700">Monto *</label>
					<input
						id="monto"
						name="monto"
						type="number"
						min="0.01"
						step="0.01"
						required
						class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
					/>
					{#if form?.errores?.monto}
						<span class="text-sm text-red-600">{form.errores.monto}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1 md:col-span-1">
					<label for="metodo" class="text-sm font-medium text-gray-700">Método *</label>
					<select
						id="metodo"
						name="metodo"
						required
						class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
					>
						<option value="" disabled selected>Selecciona</option>
						<option value="TRANSFERENCIA">Transferencia</option>
						<option value="EFECTIVO">Efectivo</option>
						<option value="CHEQUE">Cheque</option>
						<option value="TARJETA">Tarjeta</option>
					</select>
					{#if form?.errores?.metodo}
						<span class="text-sm text-red-600">{form.errores.metodo}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1 md:col-span-1">
					<label for="fecha" class="text-sm font-medium text-gray-700">Fecha (opcional)</label>
					<input
						id="fecha"
						name="fecha"
						type="date"
						class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
					/>
				</div>

				<div class="flex flex-col gap-1 md:col-span-1">
					<label for="referencia" class="text-sm font-medium text-gray-700"
						>Referencia (opcional)</label
					>
					<input
						id="referencia"
						name="referencia"
						type="text"
						class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
					/>
				</div>

				<div class="md:col-span-4">
					<button
						type="submit"
						class="rounded-lg bg-gray-900 px-5 py-2.5 text-white transition hover:bg-gray-800"
					>
						Registrar pago
					</button>
				</div>
			</form>
		{:else}
			<p class="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-800">
				Esta cotización ya está saldada. No se requieren más pagos.
			</p>
		{/if}
	</section>

	{#if transiciones(cotizacion.estado).length > 0}
		<section class="mb-6 rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-medium text-gray-900">Cambiar estado</h2>

			{#if form?.exito}
				<p class="mb-4 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-800">
					Estado actualizado correctamente.
				</p>
			{/if}

			{#if form?.error}
				<p class="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{form.error}</p>
			{/if}

			<div class="flex flex-wrap items-center gap-3">
				{#each transiciones(cotizacion.estado) as opcion (opcion.estado)}
					<form method="POST" action="?/cambiarEstado">
						<input type="hidden" name="nuevoEstado" value={opcion.estado} />
						<button
							type="submit"
							class="rounded-lg px-5 py-2.5 text-white transition {buttonTone(opcion.tone)}"
						>
							{opcion.label}
						</button>
					</form>
				{/each}
			</div>
		</section>
	{/if}

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-lg font-medium text-gray-900">Historial de cambios</h2>

		{#if cotizacion.historial.length === 0}
			<p class="text-gray-600">Aún no hay movimientos en esta cotización.</p>
		{:else}
			<ul class="space-y-3">
				{#each cotizacion.historial as registro (registro.id)}
					<li class="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0">
						<div class="text-sm">
							<p class="text-gray-900">
								{#if registro.estadoAnterior}
									De <span class="font-medium">{badgeLabel(registro.estadoAnterior)}</span>
									a <span class="font-medium">{badgeLabel(registro.estadoNuevo)}</span>
								{:else}
									Estado inicial: <span class="font-medium">{badgeLabel(registro.estadoNuevo)}</span
									>
								{/if}
							</p>
							{#if registro.nota}
								<p class="mt-1 text-gray-600">{registro.nota}</p>
							{/if}
						</div>
						<span class="text-xs text-gray-500">{formatDateTime(registro.creadoEn)}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
