<script>
	import { onMount } from 'svelte';
	import Track from './components/Track.svelte';
	import TrackSummary from './components/TrackSummary.svelte';
	import { tracks } from './stores.js';
	
	
	tracks.useLocalStorage();
	

	let selectedTrack;

	function addTrack() {
		console.log('changes are working');
		tracks.addNew();
		selectedTrack = $tracks[$tracks.length -1];
	}

	function removeTrack(event) {
		tracks.removeTrack(event.detail.id);
	}
</script>

<style>
	
</style>

<section class="section">
	<div class="columns">	
		<div class="column is-one-quarter">
			<div>
				<span>My Tracks</span>
				<a href="#" class="button is-small" on:click={addTrack}>
					<i class="iconify" 
					  data-icon="fa-solid:plus" 
					  data-inline="false"></i>
				</a>
			</div>
	
			{#each $tracks as track}
				<TrackSummary on:click={() => selectedTrack = track} 
					on:removeTrack={removeTrack}
					id={track.id}
					active={selectedTrack === track}
					name={track.name} 
					description={track.description} />		
			{/each}
		</div>
	
		<div class="column">
			{#if selectedTrack}
				<Track track={selectedTrack} />
			{/if}
		</div>
		
	</div>
</section>

