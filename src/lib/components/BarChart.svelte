<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { roundedTopBarPath } from '$lib/utils/barPath';

	interface Point {
		year: number;
		value: number;
		note: string;
	}

	let {
		title,
		points,
		locale
	}: {
		title: string;
		points: Point[];
		locale: string;
	} = $props();

	const numberFormat = $derived(new Intl.NumberFormat(locale));

	// Géométrie logique de la carte (unités de viewBox ≈ px au rendu naturel
	// dans la grille). Barre plafonnée à 24px, jamais étirée pour remplir
	// son couloir (spec du kit dataviz).
	const WIDTH = 320;
	const HEIGHT = 150;
	const PAD_LEFT = 8;
	const PAD_RIGHT = 8;
	const PAD_TOP = 22;
	const PAD_BOTTOM = 20;
	const BASELINE = HEIGHT - PAD_BOTTOM;
	const PLOT_WIDTH = WIDTH - PAD_LEFT - PAD_RIGHT;
	const PLOT_HEIGHT = BASELINE - PAD_TOP;
	const MAX_BAR_WIDTH = 24;

	const maxValue = $derived(Math.max(1, ...points.map((p) => p.value)));

	const bandWidth = $derived(points.length > 0 ? PLOT_WIDTH / points.length : PLOT_WIDTH);
	const barWidth = $derived(Math.min(MAX_BAR_WIDTH, bandWidth * 0.55));

	const bars = $derived(
		points.map((point, index) => {
			const bandCenter = PAD_LEFT + bandWidth * (index + 0.5);
			const x = bandCenter - barWidth / 2;
			const height = maxValue > 0 ? (point.value / maxValue) * PLOT_HEIGHT : 0;
			return {
				...point,
				x,
				bandCenter,
				height,
				path: roundedTopBarPath(x, BASELINE, barWidth, height, 4)
			};
		})
	);

	let hoveredIndex: number | null = $state(null);
	const hoveredBar = $derived(hoveredIndex === null ? null : bars[hoveredIndex]);

	// Dernière année : seule valeur étiquetée directement (règle "label
	// sélectivement" du kit dataviz) — les autres restent dans l'infobulle
	// et le tableau de données.
	const lastIndex = $derived(points.length - 1);
</script>

<figure class="chart">
	<figcaption>{title}</figcaption>
	<svg
		viewBox="0 0 {WIDTH} {HEIGHT}"
		role="img"
		aria-label={`${title} — ${points.map((p) => `${p.year}: ${numberFormat.format(p.value)}`).join(', ')}`}
	>
		<line class="baseline" x1={PAD_LEFT} y1={BASELINE} x2={WIDTH - PAD_RIGHT} y2={BASELINE} />

		{#each bars as bar, index (bar.year)}
			<!-- Pas de tabindex par barre : jusqu'à 8 par graphique × 19 graphiques
			     créerait des dizaines d'arrêts de tabulation sur la page. Le survol
			     (souris/tactile) affiche l'infobulle ; le clavier passe par le
			     tableau accessible plus bas, qui porte les mêmes valeurs. -->
			<g
				class="bar-group"
				aria-hidden="true"
				onpointerenter={() => (hoveredIndex = index)}
				onpointerleave={() => (hoveredIndex = null)}
			>
				<title
					>{bar.year} : {numberFormat.format(bar.value)}{bar.note ? ` — ${bar.note}` : ''}</title
				>
				<path class="bar" class:hovered={hoveredIndex === index} d={bar.path} />
				{#if index === lastIndex}
					<text class="value-label" x={bar.bandCenter} y={BASELINE - bar.height - 6}>
						{numberFormat.format(bar.value)}
					</text>
				{/if}
				<text class="year-label" x={bar.bandCenter} y={BASELINE + 14}>{bar.year}</text>
			</g>
		{/each}

		{#if hoveredBar}
			{@const tooltipWidth = 92}
			{@const tooltipX = Math.min(
				Math.max(hoveredBar.bandCenter - tooltipWidth / 2, PAD_LEFT),
				WIDTH - PAD_RIGHT - tooltipWidth
			)}
			{@const tooltipY = PAD_TOP - 2}
			<g class="tooltip" transform={`translate(${tooltipX}, ${tooltipY})`}>
				<rect width={tooltipWidth} height="30" rx="4" />
				<text class="tooltip-value" x={tooltipWidth / 2} y="13">
					{numberFormat.format(hoveredBar.value)}
				</text>
				<text class="tooltip-year" x={tooltipWidth / 2} y="24">{hoveredBar.year}</text>
			</g>
		{/if}
	</svg>

	<details>
		<summary>{$_('home.charts.tableToggle')}</summary>
		<table>
			<caption class="sr-only">{title}</caption>
			<thead>
				<tr>
					<th scope="col">{$_('home.charts.year')}</th>
					<th scope="col">{$_('home.charts.value')}</th>
				</tr>
			</thead>
			<tbody>
				{#each points as point (point.year)}
					<tr>
						<td>{point.year}</td>
						<td
							>{numberFormat.format(point.value)}{#if point.note}<span class="note">
									— {point.note}</span
								>{/if}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</details>
</figure>

<style>
	.chart {
		margin: 0;
		padding: 1rem;
		border: 1px solid #e2e2e2;
		border-radius: 0.5rem;
	}

	figcaption {
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.baseline {
		stroke: #c3c2b7;
		stroke-width: 1;
	}

	.bar {
		fill: #2a78d6;
	}

	.bar-group {
		cursor: pointer;
	}

	.bar.hovered {
		fill: #1c5cab;
	}

	.year-label {
		font-size: 9px;
		fill: #898781;
		text-anchor: middle;
	}

	.value-label {
		font-size: 10px;
		font-weight: 600;
		fill: #52514e;
		text-anchor: middle;
	}

	.tooltip rect {
		fill: #0b0b0b;
	}

	.tooltip text {
		text-anchor: middle;
		fill: #ffffff;
	}

	.tooltip-value {
		font-size: 11px;
		font-weight: 700;
	}

	.tooltip-year {
		font-size: 9px;
		opacity: 0.8;
	}

	details {
		margin-top: 0.5rem;
	}

	summary {
		font-size: 0.8rem;
		color: #52514e;
		cursor: pointer;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 0.5rem;
		font-size: 0.85rem;
	}

	th,
	td {
		text-align: left;
		padding: 0.25rem 0.5rem;
		border-bottom: 1px solid #e2e2e2;
	}

	.note {
		color: #898781;
		font-size: 0.8em;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Le reste du site n'a pas encore de mode sombre (pas de fond de page
	   défini) : pas de styles sombres ici tant que ce n'est pas traité au
	   niveau du site entier, pour éviter un résultat à moitié adapté. */
</style>
