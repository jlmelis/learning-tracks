<script>
	import { tick, createEventDispatcher } from 'svelte';
	import { tracks } from '../stores.js';
	import { selectTextOnFocus } from '../actions/inputActions.js';

	export let track;
	
	let edit;
	let nameInput

	const dispatch = createEventDispatcher();

	function removeTrack() {
		dispatch('removeTrack', {id: track.id});
	}

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

<div on:click class="panel">
	<div class="panel-heading">
		{#if edit}
			<div>
				<input class="input" bind:this={nameInput} 
					bind:value={track.name} 
					on:keydown={onEnter} 
					use:selectTextOnFocus/>
				<input class="input" bind:this={nameInput} 
					bind:value={track.description} 
					on:keydown={onEnter} 
					use:selectTextOnFocus/>
				<button class="button" on:click="{updateTrack}">
					<i class="iconify" 
						data-icon="fa-solid:check" 
						data-inline="false"></i>
				</button>
			</div>			
		{:else}
			<div>
				<span>{track.name}</span>
				<span> ({track.description})</span>
				<button class="button is-small" on:click="{editTrack}">
					<i class="iconify" 
						data-icon="fa-solid:pencil-alt" 
						data-inline="false"></i>
				</button>
				<button class="button is-small" on:click={removeTrack}>
					<i class="iconify" 
						data-icon="fa-solid:trash" 
						data-inline="false"></i>
				</button>
			</div>
		{/if}
	</div>
	
	{#if track.links}
		{#each track.links as link}
			<div class="panel-block">
				<a href='{link.href}'>{link.name}</a>
			</div>
		{/each}
	{/if}
	
</div>