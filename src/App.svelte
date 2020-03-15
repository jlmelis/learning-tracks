<script>
	import Track from './components/Track.svelte';
	import TrackSummary from './components/TrackSummary.svelte';
	import { tracks } from './stores.js';
	
	let selectedTrack;
</script>

<style>
	main {
		font-family: sans-serif;
    	display: flex;
		align-items: flex-start;
		justify-content: left;
    	border: 1px solid black;
	}

	.trackList {
		justify-content:left;
		width: 25%;
		border: 1px solid black;
	}

	.trackDetail {
		justify-content: right;
		width: 75%;
		border: 1px solid red;
	}
</style>

<main>
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
