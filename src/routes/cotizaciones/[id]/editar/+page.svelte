<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const { cotizacion, clientes } = data;

	function formatMoney(value) {
		const number = Number(value ?? 0);
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2
		}).format(number);
	}

	function filaSubtotal(row) {
		const cantidad = Number.isFinite(row.cantidad) ? row.cantidad : 0;
		const precio = Number.isFinite(row.precioUnitario) ? row.precioUnitario : 0;
		return cantidad * precio;
	}

	function vencimientoISO(fecha) {
		if (!fecha) return '';
		const d = new Date(fecha);
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}`;
	}

	let conceptos = $state(
		form?.valores
			? form.valores.descripciones.map((desc, i) => ({
					descripcion: desc,
					cantidad: Number(form.valores.cantidades[i] ?? 1),
					precioUnitario: Number(form.valores.precios[i] ?? 0)
				}))
			: cotizacion.conceptos.map((c) => ({
					descripcion: c.descripcion,
					cantidad: c.cantidad,
					precioUnitario: c.precioUnitario
				}))
	);

	function addRow() {
		conceptos = [...conceptos, { descripcion: '', cantidad: 1, precioUnitario: 0 }];
	}

	function removeRow(index) {
		conceptos = conceptos.filter((_, i) => i !== index);
	}

	function handleNumberInput(event, field, index) {
		const raw = event.target.value;
		const parsed = raw === '' ? 0 : Number(raw);
		conceptos[index] = { ...conceptos[index], [field]: Number.isFinite(parsed) ? parsed : 0 };
	}

	const subtotalGeneral = $derived(conceptos.reduce((sum, row) => sum + filaSubtotal(row), 0));
	const iva = $derived(subtotalGeneral * 0.16);
	const total = $derived(subtotalGeneral + iva);
</script>

<main class="mx-auto max-w-5xl p-6">
	<div class="mb-6">
		<a
			href="/cotizaciones/{cotizacion.id}"
			class="text-sm text-gray-600 transition hover:text-gray-900"
		>
			← Volver a la cotización
		</a>
	</div>

	<h1 class="mb-6 text-2xl font-semibold text-gray-900">
		Editar cotización {cotizacion.numero}
	</h1>

	<section class="rounded-2xl bg-white p-6 shadow-sm">
		{#if form?.errores?.general}
			<p class="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">
				{form.errores.general}
			</p>
		{/if}

		<form method="POST" use:enhance class="space-y-6">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="flex flex-col gap-1">
					<label for="clienteId" class="text-sm font-medium text-gray-700">Cliente *</label>
					<select
						id="clienteId"
						name="clienteId"
						required
						class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
					>
						<option value="" disabled>Selecciona un cliente</option>
						{#each clientes as cliente (cliente.id)}
							<option
								value={cliente.id}
								selected={cliente.id === (form?.valores?.clienteId ?? cotizacion.clienteId)}
							>
								{cliente.nombre}{cliente.empresa ? ` — ${cliente.empresa}` : ''}
							</option>
						{/each}
					</select>
					{#if form?.errores?.clienteId}
						<span class="text-sm text-red-600">{form.errores.clienteId}</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<label for="vencimiento" class="text-sm font-medium text-gray-700"
						>Vencimiento (opcional)</label
					>
					<input
						id="vencimiento"
						name="vencimiento"
						type="date"
						value={form?.valores?.vencimiento ?? vencimientoISO(cotizacion.vencimiento)}
						class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
					/>
				</div>
			</div>

			<div>
				<div class="mb-3 flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900">Conceptos</h2>
					<button
						type="button"
						onclick={addRow}
						class="rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
					>
						+ Agregar concepto
					</button>
				</div>

				{#if conceptos.length === 0}
					<p class="text-sm text-gray-500">No hay conceptos aún. Agrega uno para comenzar.</p>
				{:else}
					<div class="space-y-3 rounded-xl border border-gray-200 p-4">
						{#each conceptos as row, index (index)}
							<div class="grid grid-cols-1 items-start gap-3 md:grid-cols-12">
								<div class="md:col-span-6">
									<label class="mb-1 block text-xs font-medium text-gray-600">Descripción</label>
									<input
										name="descripcion"
										type="text"
										bind:value={row.descripcion}
										class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
									/>
								</div>
								<div class="md:col-span-2">
									<label class="mb-1 block text-xs font-medium text-gray-600">Cantidad</label>
									<input
										name="cantidad"
										type="number"
										min="0"
										step="0.01"
										value={row.cantidad}
										oninput={(e) => handleNumberInput(e, 'cantidad', index)}
										class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
									/>
								</div>
								<div class="md:col-span-2">
									<label class="mb-1 block text-xs font-medium text-gray-600"
										>Precio unitario</label
									>
									<input
										name="precioUnitario"
										type="number"
										min="0"
										step="0.01"
										value={row.precioUnitario}
										oninput={(e) => handleNumberInput(e, 'precioUnitario', index)}
										class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
									/>
								</div>
								<div class="flex items-end justify-between gap-2 md:col-span-2">
									<div class="text-sm">
										<p class="text-xs text-gray-500">Subtotal</p>
										<p class="font-medium text-gray-900">{formatMoney(filaSubtotal(row))}</p>
									</div>
									{#if conceptos.length > 1}
										<button
											type="button"
											onclick={() => removeRow(index)}
											class="text-sm text-red-600 transition hover:text-red-800"
										>
											Quitar
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label for="notas" class="text-sm font-medium text-gray-700">Notas</label>
				<textarea
					id="notas"
					name="notas"
					rows="3"
					value={form?.valores?.notas ?? cotizacion.notas ?? ''}
					class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none"
				></textarea>
			</div>

			<div class="flex flex-col items-end gap-2 border-t border-gray-200 pt-4">
				<div class="flex w-full max-w-sm justify-between text-sm text-gray-600">
					<span>Subtotal</span>
					<span>{formatMoney(subtotalGeneral)}</span>
				</div>
				<div class="flex w-full max-w-sm justify-between text-sm text-gray-600">
					<span>IVA (16%)</span>
					<span>{formatMoney(iva)}</span>
				</div>
				<div class="flex w-full max-w-sm justify-between text-lg font-semibold text-gray-900">
					<span>Total</span>
					<span>{formatMoney(total)}</span>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<button
					type="submit"
					class="rounded-lg bg-gray-900 px-5 py-2.5 text-white transition hover:bg-gray-800"
				>
					Guardar cambios
				</button>
				<a
					href="/cotizaciones/{cotizacion.id}"
					class="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-50"
				>
					Cancelar
				</a>
			</div>
		</form>
	</section>
</main>
