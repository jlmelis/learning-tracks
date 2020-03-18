<script>
	import { onMount } from 'svelte';
	import Track from './components/Track.svelte';
	import TrackSummary from './components/TrackSummary.svelte';
	import { tracks } from './stores.js';
	
	
	tracks.useLocalStorage();
	

	let selectedTrack;
	let showTracksPanel = true;

	function addTrack() {
		console.log('changes are working');
		tracks.addNew();
		selectedTrack = $tracks[$tracks.length -1];
	}

	function removeTrack(event) {
		selectedTrack = {};
		tracks.removeTrack(event.detail.id);
		showTracksPanel = true;
	}
	
	function selectTrack(track) {
		selectedTrack = track;
		showTracksPanel = false;
	}
</script>

<style>
	
</style>

<div class="container is-fluid">
	{#if !showTracksPanel}
		<div>
			<a href="#" class="button" on:click="{() => showTracksPanel = true}">
				Pick track
			</a>
			<Track on:removeTrack={removeTrack} track={selectedTrack} />		
		</div>
		
	{:else}
		<div class="panel">
			<div class="panel-heading">
				<span>Tracks</span>
				<a href="#" class="button is-small" on:click={addTrack}>
					<i class="iconify" 
							data-icon="fa-solid:plus" 
							data-inline="false" 
							aria-hidden="true"/>
				</a>
			</div>
			
			<div class="panel-block">
				<p class="control has-icons-left">
					<input class="input" type="text" placeholder="Search">
					<span class="icon is-left">
						<i class="iconify" 
							data-icon="fa-solid:search" 
							data-inline="false" 
							aria-hidden="true"/>
					</span>
				</p>
			</div>

			{#each $tracks as track}
				<div class="panel-block">
					<TrackSummary on:click={selectTrack(track)} 
						id={track.id}
						active={selectedTrack === track}
						name={track.name} 
						description={track.description} />
				</div>	
			{/each}
		</div>

	{/if}
</div>
