<script>
	import { onMount } from 'svelte';

	let { data } = $props();
	const {
		kpis,
		cotizacionesPorEstado,
		ingresosPorMes,
		cotizacionesPorVencer,
		topClientes,
		tendenciaCobrado
	} = data;

	let barCanvas = $state(null);
	let doughnutCanvas = $state(null);

	function saludoDelDia() {
		const hora = new Date().getHours();
		if (hora < 12) return 'Buenos días';
		if (hora < 19) return 'Buenas tardes';
		return 'Buenas noches';
	}

	function formatMoney(value) {
		const number = Number(value ?? 0);
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2
		}).format(number);
	}

	function formatDate(date) {
		if (!date) return 'Sin fecha';
		return new Date(date).toLocaleDateString('es-MX', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	const coloresEstado = {
		BORRADOR: '#9ca3af',
		ENVIADA: '#3b82f6',
		APROBADA: '#22c55e',
		RECHAZADA: '#ef4444',
		FACTURADA: '#a855f7',
		PAGADA: '#10b981'
	};

	const etiquetasEstado = {
		BORRADOR: 'Borrador',
		ENVIADA: 'Enviada',
		APROBADA: 'Aprobada',
		RECHAZADA: 'Rechazada',
		FACTURADA: 'Facturada',
		PAGADA: 'Pagada'
	};

	let barChart = null;
	let doughnutChart = null;

	onMount(async () => {
		const { default: Chart } = await import('chart.js/auto');

		if (barCanvas) {
			barChart = new Chart(barCanvas.getContext('2d'), {
				type: 'bar',
				data: {
					labels: ingresosPorMes.map((item) => item.mes),
					datasets: [
						{
							label: 'Ingresos cobrados',
							data: ingresosPorMes.map((item) => item.total),
							backgroundColor: '#3b82f6',
							borderRadius: 6,
							borderSkipped: false
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							ticks: {
								callback: (value) => `$${Number(value).toLocaleString('es-MX')}`
							}
						}
					}
				}
			});
		}

		if (doughnutCanvas) {
			const estados = Object.keys(cotizacionesPorEstado);
			doughnutChart = new Chart(doughnutCanvas.getContext('2d'), {
				type: 'doughnut',
				data: {
					labels: estados.map((estado) => etiquetasEstado[estado] ?? estado),
					datasets: [
						{
							data: estados.map((estado) => cotizacionesPorEstado[estado]),
							backgroundColor: estados.map((estado) => coloresEstado[estado] ?? '#9ca3af'),
							borderWidth: 0,
							hoverOffset: 8
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								usePointStyle: true,
								padding: 16
							}
						}
					}
				}
			});
		}

		return () => {
			barChart?.destroy();
			doughnutChart?.destroy();
		};
	});
</script>

<main class="min-h-screen bg-gray-50 p-6">
	<div class="mx-auto max-w-6xl">
		<div class="mb-8">
			<h1 class="text-2xl font-semibold text-gray-900">{saludoDelDia()}</h1>
			<p class="mt-1 text-gray-600">Aquí está el resumen de tu negocio hoy.</p>
		</div>

		<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-2xl bg-white p-6 shadow-sm">
				<div class="mb-2 flex items-center gap-2">
					<span class="rounded-lg bg-purple-100 p-1.5 text-purple-700">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</span>
					<p class="text-sm font-medium text-gray-600">Total facturado</p>
				</div>
				<p class="text-2xl font-semibold text-gray-900">{formatMoney(kpis.totalFacturado)}</p>
			</div>

			<div class="rounded-2xl bg-white p-6 shadow-sm">
				<div class="mb-2 flex items-center gap-2">
					<span class="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</span>
					<p class="text-sm font-medium text-gray-600">Total cobrado</p>
				</div>
				<p class="text-2xl font-semibold text-gray-900">{formatMoney(kpis.totalCobrado)}</p>
				{#if tendenciaCobrado.direccion === 'sin_datos' || tendenciaCobrado.porcentaje === null}
					<p class="mt-2 text-xs text-gray-500">Sin comparación previa</p>
				{:else}
					<p
						class="mt-2 flex items-center gap-1 text-xs font-medium {tendenciaCobrado.direccion ===
						'sube'
							? 'text-emerald-700'
							: tendenciaCobrado.direccion === 'baja'
								? 'text-red-700'
								: 'text-gray-600'}"
					>
						{#if tendenciaCobrado.direccion === 'sube'}↑{:else if tendenciaCobrado.direccion === 'baja'}↓{:else}={/if}
						{tendenciaCobrado.porcentaje}% vs. mes anterior
					</p>
				{/if}
			</div>

			<div class="rounded-2xl bg-white p-6 shadow-sm">
				<div class="mb-2 flex items-center gap-2">
					<span class="rounded-lg bg-amber-100 p-1.5 text-amber-700">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</span>
					<p class="text-sm font-medium text-gray-600">Cartera pendiente</p>
				</div>
				<p class="text-2xl font-semibold text-gray-900">{formatMoney(kpis.carteraPendiente)}</p>
			</div>

			<div class="rounded-2xl bg-white p-6 shadow-sm">
				<div class="mb-2 flex items-center gap-2">
					<span class="rounded-lg bg-blue-100 p-1.5 text-blue-700">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
					</span>
					<p class="text-sm font-medium text-gray-600">Cotizaciones activas</p>
				</div>
				<p class="text-2xl font-semibold text-gray-900">{kpis.cotizacionesActivas}</p>
			</div>
		</div>

		<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<section class="rounded-2xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Ingresos por mes</h2>
				<div class="h-72 w-full">
					<canvas bind:this={barCanvas} class="h-full w-full"></canvas>
				</div>
			</section>

			<section class="rounded-2xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Cotizaciones por estado</h2>
				<div class="h-72 w-full">
					<canvas bind:this={doughnutCanvas} class="h-full w-full"></canvas>
				</div>
			</section>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<section class="rounded-2xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Cotizaciones por vencer</h2>

				{#if cotizacionesPorVencer.length === 0}
					<p class="text-gray-600">
						¡Buenas noticias! No hay cotizaciones próximas a vencer con saldo pendiente en los
						siguientes 15 días.
					</p>
				{:else}
					<ul class="space-y-3">
						{#each cotizacionesPorVencer as cuenta (cuenta.numero)}
							<li
								class="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
							>
								<div>
									<p class="font-medium text-gray-900">{cuenta.numero}</p>
									<p class="text-sm text-gray-600">{cuenta.cliente}</p>
								</div>
								<div class="text-right">
									<p class="font-medium text-gray-900">{formatMoney(cuenta.saldo)}</p>
									<p class="text-xs text-gray-500">Vence {formatDate(cuenta.vencimiento)}</p>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<section class="rounded-2xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Top 3 clientes</h2>

				{#if topClientes.length === 0}
					<p class="text-gray-600">
						Aún no hay clientes con facturación registrada. Aparecerán aquí cuando tengas
						cotizaciones facturadas o pagadas.
					</p>
				{:else}
					<ul class="space-y-3">
						{#each topClientes as cliente, index (cliente.nombre)}
							<li class="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0">
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700"
								>
									{index + 1}
								</div>
								<div class="flex-1">
									<p class="font-medium text-gray-900">
										{cliente.nombre}
										{cliente.empresa ? `— ${cliente.empresa}` : ''}
									</p>
									<p class="text-sm font-medium text-gray-900">
										{formatMoney(cliente.totalFacturado)}
									</p>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>
	</div>
</main>
