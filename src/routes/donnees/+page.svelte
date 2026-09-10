<script lang="ts">
	import { resolve } from '$app/paths';
	import { _ } from 'svelte-i18n';
	import { formatBytes } from '$lib/utils/formatBytes';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(iso: string): string {
		return new Intl.DateTimeFormat(data.locale, { dateStyle: 'long' }).format(new Date(iso));
	}
</script>

<svelte:head>
	<title>{$_('data.pageTitle')} · {$_('app.title')}</title>
</svelte:head>

<section>
	<h1>{$_('data.pageTitle')}</h1>
	<p class="intro">{$_('data.intro')}</p>

	{#if data.loadError}
		<p class="notice notice-error">{$_('data.error')}</p>
	{:else if data.dataSources.length === 0}
		<p class="notice">{$_('data.empty')}</p>
	{:else}
		<ul class="data-list">
			{#each data.dataSources as item (item.id)}
				<li class="data-item">
					<h2>{item.title}</h2>
					{#if item.description}
						<p class="description">{item.description}</p>
					{/if}
					<p class="meta">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- URL externe (source d'origine du document), pas une route interne -->
						<a href={item.sourceUrl} target="_blank" rel="noreferrer">{$_('data.sourceLink')}</a>
						<span class="dot" aria-hidden="true">·</span>
						<span
							>{$_('data.downloadedOn', { values: { date: formatDate(item.downloadedAt) } })}</span
						>
					</p>
					<p class="downloads">
						<a class="download" href={resolve('/donnees/telecharger/[id]', { id: item.id })}>
							{$_('data.download')} ({formatBytes(item.fileSizeBytes)})
						</a>
						{#if item.extractedDataFileName}
							<a
								class="download"
								href={resolve('/donnees/telecharger-donnees-extraites/[id]', { id: item.id })}
							>
								{$_('data.downloadExtracted')}
							</a>
						{/if}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
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

	.data-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.data-item {
		border: 1px solid #e2e2e2;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.data-item h2 {
		margin: 0 0 0.5rem;
		font-size: 1.05rem;
	}

	.description {
		color: #555;
		margin: 0 0 0.5rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #666;
		margin: 0 0 0.75rem;
	}

	.dot {
		color: #bbb;
	}

	.downloads {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin: 0;
	}

	.download {
		display: inline-block;
		font-weight: 600;
	}
</style>
