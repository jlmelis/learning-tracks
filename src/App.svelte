<script>
	import Track from './components/Track.svelte';
	import TrackSummary from './components/TrackSummary.svelte';
	import { tracks } from './stores.js';
	
	let selectedTrack;

	function addTrack() {
		tracks.addNew();
		selectedTrack = $tracks[$tracks.length -1];
	}
</script>

<style>
	main {
		font-family: sans-serif;
    	display: flex;
		align-items: flex-start;
		justify-content: left;
	}

	.trackList {
		justify-content:left;
		width: 25%;
	}

	.trackDetail {
		justify-content: right;
		width: 75%;
	}
</style>

<main>
	<div>
		<button on:click={addTrack}>
			new track
		</button>
	</div>
	
	<div class="trackList">
		{#each $tracks as track}
			<TrackSummary on:click={() => selectedTrack = track} 
				name={track.name} 
				description={track.description} />		
		{/each}
	</div>

	<div class="trackDetail">
		{#if selectedTrack}
			<Track {...selectedTrack} />
		{/if}
	</div>
	
</main>
