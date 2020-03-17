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
				<a href="#" class="button" on:click="{updateTrack}">
					<i class="iconify" 
						data-icon="fa-solid:check" 
						data-inline="false"></i>
				</a>
			</div>			
		{:else}
			<span>{track.name}</span>
			<span> ({track.description})</span>
			<a href="#" class="button is-small" on:click="{editTrack}">
				<i class="iconify" 
					data-icon="fa-solid:pencil-alt" 
					data-inline="false"></i>
			</a>
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