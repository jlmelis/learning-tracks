<script>
	import Track from './components/Track.svelte';
	import TrackSummary from './components/TrackSummary.svelte';
	import { tracks } from './stores.js';
	
	let selectedTrack;

	function addTrack() {
		tracks.addNew();
		selectedTrack = $tracks[$tracks.length -1];
	}

	function removeTrack(event) {
		tracks.removeTrack(event.detail.id);
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
		margin-top: 10px;
		width: 25%;
	}

	.trackDetail {
		justify-content: right;
		width: 75%;
	}

	button {
		font-size: 100%;
		font-family: inherit;
		border: 0;
		padding: 0;
		background: none;
	}

	.iconify {
		cursor: pointer;
		height: 1.5em;
		width: 2em;
		color: grey;
	}

	.iconify:hover {
		color: black;
	}

</style>

<main>	
	<div class="trackList">
		<div>
			<span>My Tracks</span>
			<button on:click={addTrack}>
				<span class="iconify" 
				  data-icon="ic:twotone-add-circle" 
				  data-inline="false"></span>
			</button>
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

	<div class="trackDetail">
		{#if selectedTrack}
			<Track track={selectedTrack} />
		{/if}
	</div>
	
</main>
