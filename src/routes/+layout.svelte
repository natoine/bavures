<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { isLoading, _ } from 'svelte-i18n';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if $isLoading}
	<!-- Évite un flash de clés de traduction non résolues pendant le chargement -->
{:else}
	<div class="app">
		<header class="site-header">
			<a class="brand" href={resolve('/')}>{$_('app.title')}</a>
			<nav>
				<a href={resolve('/')}>{$_('nav.home')}</a>
				<a href={resolve('/changelog')}>{$_('nav.changelog')}</a>
			</nav>
		</header>

		<main>
			{@render children()}
		</main>

		<footer class="site-footer">
			<a href="https://github.com/natoine/bavures" target="_blank" rel="noreferrer">
				{$_('footer.sourceCode')}
			</a>
			<a href={resolve('/aarri')}>{$_('footer.aarri')}</a>
			<a href={resolve('/donnees')}>{$_('data.pageTitle')}</a>
		</footer>
	</div>
{/if}

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.site-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		border-bottom: 1px solid #e2e2e2;
	}

	.site-header nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.brand {
		font-weight: 700;
		font-size: 1.25rem;
		text-decoration: none;
		color: inherit;
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 60rem;
		margin: 0 auto;
		padding: 1rem;
		box-sizing: border-box;
	}

	.site-footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		padding: 1rem;
		font-size: 0.875rem;
		border-top: 1px solid #e2e2e2;
	}

	/* Mobile-first : la navigation passe en ligne dès un écran plus large */
	@media (min-width: 40rem) {
		.site-header {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}
</style>
