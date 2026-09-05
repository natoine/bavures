<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$_('changelog.heading')} · {$_('app.title')}</title>
</svelte:head>

<section>
	<div class="changelog-content">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- contenu généré depuis CHANGELOG.md, fichier du dépôt (non issu d'une saisie utilisateur) -->
		{@html data.html}
	</div>
</section>

<style>
	.changelog-content {
		overflow-x: auto;
	}

	.changelog-content :global(pre) {
		overflow-x: auto;
	}

	.changelog-content :global(table) {
		display: block;
		overflow-x: auto;
		border-collapse: collapse;
	}
</style>
