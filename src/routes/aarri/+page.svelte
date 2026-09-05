<script lang="ts">
	import { _ } from 'svelte-i18n';

	const aarriRows = $derived([
		{ step: $_('aarri.steps.acquisition'), metric: $_('aarri.placeholder.metric'), value: 0 },
		{ step: $_('aarri.steps.activation'), metric: $_('aarri.placeholder.metric'), value: 0 },
		{ step: $_('aarri.steps.retention'), metric: $_('aarri.placeholder.metric'), value: 0 },
		{ step: $_('aarri.steps.referral'), metric: $_('aarri.placeholder.metric'), value: 0 },
		{ step: $_('aarri.steps.impact'), metric: $_('aarri.placeholder.metric'), value: 0 }
	]);

	const impactMatrix = $derived([
		{
			stage: $_('aarri.impact.utilisable.label'),
			metrics: [
				$_('aarri.impact.utilisable.m1'),
				$_('aarri.impact.utilisable.m2'),
				$_('aarri.impact.utilisable.m3')
			]
		},
		{
			stage: $_('aarri.impact.utilise.label'),
			metrics: [
				$_('aarri.impact.utilise.m1'),
				$_('aarri.impact.utilise.m2'),
				$_('aarri.impact.utilise.m3'),
				$_('aarri.impact.utilise.m4')
			]
		},
		{
			stage: $_('aarri.impact.utile.label'),
			metrics: [$_('aarri.impact.utile.m1'), $_('aarri.impact.utile.m2')]
		},
		{
			stage: $_('aarri.impact.impactant.label'),
			metrics: [
				$_('aarri.impact.impactant.m1'),
				$_('aarri.impact.impactant.m2'),
				$_('aarri.impact.impactant.m3')
			]
		}
	]);
</script>

<svelte:head>
	<title>{$_('aarri.pageTitle')} · {$_('app.title')}</title>
</svelte:head>

<section>
	<h1>{$_('aarri.pageTitle')}</h1>
	<p class="subtitle">{$_('aarri.subtitle')}</p>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>{$_('aarri.col.step')}</th>
					<th>{$_('aarri.col.metric')}</th>
					<th class="col-value">{$_('aarri.col.value')}</th>
				</tr>
			</thead>
			<tbody>
				{#each aarriRows as row (row.step)}
					<tr>
						<td class="cell-step">{row.step}</td>
						<td class="cell-metric">{row.metric}</td>
						<td class="cell-value">{row.value}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h2>{$_('aarri.impact.title')}</h2>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>{$_('aarri.impact.col.stage')}</th>
					<th>{$_('aarri.impact.col.metric')}</th>
					<th class="col-value">{$_('aarri.impact.col.value')}</th>
				</tr>
			</thead>
			<tbody>
				{#each impactMatrix as group (group.stage)}
					{#each group.metrics as metric, i (metric)}
						<tr class:group-start={i === 0}>
							{#if i === 0}
								<td class="cell-stage" rowspan={group.metrics.length}>{group.stage}</td>
							{/if}
							<td class="cell-metric">{metric}</td>
							<td class="cell-value">0</td>
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.subtitle {
		color: #555;
		margin-bottom: 2rem;
	}

	h2 {
		margin-block: 2rem 1rem;
		font-size: 1.15rem;
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid #e2e2e2;
		border-radius: 0.5rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 28rem;
	}

	thead tr {
		background: #f7f7f7;
		border-bottom: 1px solid #e2e2e2;
	}

	th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #666;
	}

	th.col-value,
	td.cell-value {
		text-align: right;
		white-space: nowrap;
	}

	tbody tr {
		border-bottom: 1px solid #e2e2e2;
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	td {
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		vertical-align: middle;
	}

	.cell-step {
		font-weight: 600;
		white-space: nowrap;
	}

	.cell-stage {
		font-weight: 700;
		white-space: nowrap;
		border-right: 1px solid #e2e2e2;
		background: #f7f7f7;
		vertical-align: middle;
	}

	.cell-metric {
		color: #666;
		font-style: italic;
	}

	.cell-value {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}

	/* Mobile-first : tableau scrollable horizontalement en dessous de 28rem */
	@media (min-width: 40rem) {
		table {
			min-width: 0;
		}
	}
</style>
