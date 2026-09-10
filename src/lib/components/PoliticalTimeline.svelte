<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { normalizeAffiliation, orderedDistinctAffiliations } from '$lib/politicalTimeline';
	import type { TenureBlock } from '$lib/politicalTimeline';

	let {
		president,
		ministre
	}: {
		president: TenureBlock[];
		ministre: TenureBlock[];
	} = $props();

	// Palette catégorielle (kit dataviz du projet, huit teintes fixes, jamais
	// réordonnées) : on prend les emplacements 1..N dans cet ordre, jamais
	// un sous-ensemble arbitraire.
	const CATEGORICAL_HUES = [
		'#2a78d6',
		'#eb6834',
		'#1baf7a',
		'#eda100',
		'#e87ba4',
		'#008300',
		'#4a3aa7',
		'#e34948'
	];
	const OTHER_COLOR = '#898781';

	const allBlocks = $derived([...president, ...ministre]);
	const affiliationOrder = $derived(orderedDistinctAffiliations(allBlocks));
	const colorByAffiliation = $derived(
		new Map(
			affiliationOrder.map((label, index) => [
				label,
				index < CATEGORICAL_HUES.length ? CATEGORICAL_HUES[index] : OTHER_COLOR
			])
		)
	);

	function colorFor(block: TenureBlock): string {
		return colorByAffiliation.get(normalizeAffiliation(block.affiliation)) ?? OTHER_COLOR;
	}

	const minYear = $derived(Math.floor(Math.min(...allBlocks.map((b) => b.start))));
	const maxYear = $derived(Math.ceil(Math.max(...allBlocks.map((b) => b.end))));

	const WIDTH = 800;
	const PAD_LEFT = 4;
	const PAD_RIGHT = 4;
	const ROW_HEIGHT = 26;
	const TITLE_HEIGHT = 16;
	const ROW_BLOCK = TITLE_HEIGHT + ROW_HEIGHT + 8;
	const AXIS_HEIGHT = 18;
	const HEIGHT = ROW_BLOCK * 2 + AXIS_HEIGHT;
	const PLOT_WIDTH = WIDTH - PAD_LEFT - PAD_RIGHT;
	const GAP = 1.5;
	// Largeur minimale (en unités de viewBox) pour afficher le nom en clair
	// dans le segment plutôt que de le réserver à l'infobulle et au tableau
	// (règle "measure first, never clip" du kit dataviz).
	const MIN_LABEL_WIDTH_PER_CHAR = 4.8;

	function x(year: number): number {
		return PAD_LEFT + ((year - minYear) / (maxYear - minYear)) * PLOT_WIDTH;
	}

	interface RenderedBlock extends TenureBlock {
		x: number;
		width: number;
		showLabel: boolean;
	}

	function toRendered(blocks: TenureBlock[]): RenderedBlock[] {
		return blocks.map((block) => {
			const startX = x(block.start) + GAP / 2;
			const endX = x(block.end) - GAP / 2;
			const width = Math.max(endX - startX, 0);
			return {
				...block,
				x: startX,
				width,
				showLabel: width >= block.person.length * MIN_LABEL_WIDTH_PER_CHAR
			};
		});
	}

	const renderedPresident = $derived(toRendered(president));
	const renderedMinistre = $derived(toRendered(ministre));

	const yearTicks = $derived(
		Array.from(
			{ length: Math.floor((maxYear - minYear) / 5) + 1 },
			(_, i) => minYear + i * 5
		).filter((year) => year <= maxYear)
	);

	function formatRange(block: TenureBlock): string {
		const start = Math.floor(block.start);
		// La borne de fin est exclusive : une fin en X.0 signifie "jusqu'à
		// fin (X-1)".
		const end = Math.ceil(block.end) - (Number.isInteger(block.end) ? 1 : 0);
		return start === end ? `${start}` : `${start}–${end}`;
	}

	let hovered: TenureBlock | null = $state(null);
</script>

<figure class="timeline">
	<figcaption>{$_('home.timeline.title')}</figcaption>

	<ul class="legend">
		{#each affiliationOrder as label (label)}
			<li>
				<span class="swatch" style:background={colorByAffiliation.get(label)}></span>
				{label}
			</li>
		{/each}
	</ul>

	<svg viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label={$_('home.timeline.title')}>
		<text class="row-title" x={PAD_LEFT} y={TITLE_HEIGHT - 4}>{$_('home.timeline.president')}</text>
		{#each renderedPresident as block (block.person + block.start)}
			<g
				class="segment"
				role="presentation"
				onpointerenter={() => (hovered = block)}
				onpointerleave={() => (hovered = null)}
			>
				<title>{block.person} — {block.affiliation} — {formatRange(block)}</title>
				<rect
					x={block.x}
					y={TITLE_HEIGHT}
					width={block.width}
					height={ROW_HEIGHT}
					rx="3"
					fill={colorFor(block)}
					class:hovered={hovered === block}
				/>
				{#if block.showLabel}
					<text
						class="segment-label"
						x={block.x + block.width / 2}
						y={TITLE_HEIGHT + ROW_HEIGHT / 2 + 4}>{block.person}</text
					>
				{/if}
			</g>
		{/each}

		<text class="row-title" x={PAD_LEFT} y={ROW_BLOCK + TITLE_HEIGHT - 4}
			>{$_('home.timeline.ministre')}</text
		>
		{#each renderedMinistre as block (block.person + block.start)}
			<g
				class="segment"
				role="presentation"
				onpointerenter={() => (hovered = block)}
				onpointerleave={() => (hovered = null)}
			>
				<title>{block.person} — {block.affiliation} — {formatRange(block)}</title>
				<rect
					x={block.x}
					y={ROW_BLOCK + TITLE_HEIGHT}
					width={block.width}
					height={ROW_HEIGHT}
					rx="3"
					fill={colorFor(block)}
					class:hovered={hovered === block}
				/>
				{#if block.showLabel}
					<text
						class="segment-label"
						x={block.x + block.width / 2}
						y={ROW_BLOCK + TITLE_HEIGHT + ROW_HEIGHT / 2 + 4}>{block.person}</text
					>
				{/if}
			</g>
		{/each}

		<line class="axis" x1={PAD_LEFT} y1={ROW_BLOCK * 2} x2={WIDTH - PAD_RIGHT} y2={ROW_BLOCK * 2} />
		{#each yearTicks as year (year)}
			<text class="year-tick" x={x(year)} y={ROW_BLOCK * 2 + AXIS_HEIGHT - 4}>{year}</text>
		{/each}
	</svg>

	{#if hovered}
		<p class="hover-readout" aria-live="polite">
			<strong>{hovered.person}</strong> — {hovered.affiliation} — {formatRange(hovered)}
		</p>
	{/if}

	<details>
		<summary>{$_('home.timeline.tableToggle')}</summary>
		<table>
			<caption class="sr-only">{$_('home.timeline.title')}</caption>
			<thead>
				<tr>
					<th scope="col">{$_('home.timeline.role')}</th>
					<th scope="col">{$_('home.timeline.person')}</th>
					<th scope="col">{$_('home.timeline.affiliation')}</th>
					<th scope="col">{$_('home.timeline.period')}</th>
				</tr>
			</thead>
			<tbody>
				{#each [...president, ...ministre].sort((a, b) => a.start - b.start) as block (block.role + block.person + block.start)}
					<tr>
						<td
							>{block.role === 'president'
								? $_('home.timeline.president')
								: $_('home.timeline.ministre')}</td
						>
						<td>{block.person}</td>
						<td>{block.affiliation}</td>
						<td>{formatRange(block)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</details>
</figure>

<style>
	.timeline {
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

	.legend {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 0 0 0.75rem;
		padding: 0;
		font-size: 0.8rem;
		color: #52514e;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.swatch {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 2px;
	}

	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.row-title {
		font-size: 10px;
		font-weight: 600;
		fill: #52514e;
	}

	.segment {
		cursor: pointer;
	}

	rect.hovered {
		opacity: 0.85;
	}

	.segment-label {
		font-size: 9px;
		fill: #ffffff;
		text-anchor: middle;
		pointer-events: none;
	}

	.axis {
		stroke: #c3c2b7;
		stroke-width: 1;
	}

	.year-tick {
		font-size: 9px;
		fill: #898781;
		text-anchor: middle;
	}

	.hover-readout {
		min-height: 1.25rem;
		margin: 0.5rem 0 0;
		font-size: 0.85rem;
		color: #52514e;
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
</style>
