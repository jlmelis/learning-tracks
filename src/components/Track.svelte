<script>
	import { tick } from 'svelte';
	import { tracks } from '../stores.js';
	import { selectTextOnFocus } from '../actions/inputActions.js';

	export let track;
	
	let edit;

	let nameInput

	async function editTrack() {
		edit = true;

		// using tick to wait for the input to be shown
		await tick();
		nameInput.focus();
	}

	function updateTrack() {
		tracks.updateTrack(track);
		edit = false;
	}

	function onEnter(event) {
		if (event.key === 'Enter') {
			updateTrack();
		}
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
				<input bind:this={nameInput} 
					bind:value={track.name} 
					on:keydown={onEnter} 
					use:selectTextOnFocus/>
				<input bind:this={nameInput} 
					bind:value={track.description} 
					on:keydown={onEnter} 
					use:selectTextOnFocus/>
				<button on:click="{updateTrack}">
					<span class="iconify" 
						data-icon="ic:twotone-check-circle" 
						data-inline="false"></span>
				</button>
			</div>			
		{:else}
			<span>{track.name}</span>
			<span> ({track.description})</span>
			<button on:click="{editTrack}">
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