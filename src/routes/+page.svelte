<script lang="ts">
	import { resolve } from '$app/paths';
	import { _ } from 'svelte-i18n';
	import BarChart from '$lib/components/BarChart.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$_('app.title')}</title>
</svelte:head>

<section>
	<h1>{$_('home.heading')}</h1>
	<p class="tagline">{$_('app.tagline')}</p>
	<p>{$_('home.intro')}</p>
</section>

<section class="charts-section">
	<h2>{$_('home.charts.heading')}</h2>
	<p class="intro">
		{$_('home.charts.intro')}
		<a href={resolve('/donnees')}>{$_('home.charts.detailLink')}</a>
	</p>

	{#if data.loadError}
		<p class="notice notice-error">{$_('home.charts.error')}</p>
	{:else if data.metricSeries.length === 0}
		<p class="notice">{$_('home.charts.empty')}</p>
	{:else}
		<div class="charts-grid">
			{#each data.metricSeries as series (series.slug)}
				<BarChart title={series.label} points={series.points} locale={data.locale} />
			{/each}
		</div>
	{/if}
</section>

<style>
	.tagline {
		font-style: italic;
		color: #555;
	}

	.charts-section {
		margin-top: 2rem;
	}

	.charts-section h2 {
		margin-bottom: 0.25rem;
	}

	.intro {
		color: #555;
		margin-bottom: 1.5rem;
	}

	.notice {
		padding: 1rem;
		border: 1px solid #e2e2e2;
		border-radius: 0.5rem;
		color: #555;
	}

	.notice-error {
		border-color: #e2b0b0;
		color: #8a2c2c;
		background: #fdf3f3;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	/* Mobile-first : plusieurs colonnes dès un écran plus large */
	@media (min-width: 40rem) {
		.charts-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 64rem) {
		.charts-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
