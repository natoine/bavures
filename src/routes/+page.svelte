<script lang="ts">
	import { _ } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$_('app.title')}</title>
</svelte:head>

<section>
	<h1>{$_('home.heading')}</h1>
	<p class="tagline">{$_('app.tagline')}</p>
	<p>{$_('home.intro')}</p>
	<p>{$_('home.comingSoon')}</p>
</section>

<style>
	.tagline {
		font-style: italic;
		color: #555;
	}
</style>
