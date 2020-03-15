<script>
	export let name;
	export let description;
	export let links;
</script>

<div on:click>
		<span>{name} ({description})</span>
		<ul>
			{#if links}
				{#each links as link}
					<li>
						<a href='{link.href}'>{link.name}</a>
					</li>
				{/each}
			{/if}
		</ul>
	</div>