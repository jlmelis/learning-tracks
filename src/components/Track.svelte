<script>
	import { tracks } from '../stores.js';
	
	export let track;
	

	let edit;

	function updateTrack () {
		tracks.updateTrack(track);
		edit = false;
	}
</script>

<style>
	button {
		font-size: 100%;
		font-family: inherit;
		border: 0;
		padding: 0;
		background: none;
	}

    .iconify {
		cursor: pointer;
		color: grey;
	}

	.iconify:hover {
		color: black;
	}
</style>

<div on:click>
	<div>
		{#if edit}
			<div>
				<input bind:value={track.name} />
				<button on:click="{updateTrack}">
					<span class="iconify" 
						data-icon="ic:twotone-check-circle" 
						data-inline="false"></span>
				</button>
			</div>			
		{:else}
			<span>{track.name}</span>
			<button on:click="{() => edit = true}">
				<span class="iconify" 
					data-icon="ic:twotone-edit" 
					data-inline="false"></span>
			</button>
		{/if}
	</div>
		
	<ul>
		{#if track.links}
			{#each track.links as link}
				<li>
					<a href='{link.href}'>{link.name}</a>
				</li>
			{/each}
		{/if}
	</ul>
</div>