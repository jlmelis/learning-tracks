<script>
	import { onMount } from 'svelte';
	import Track from './components/Track.svelte';
	import TrackSummary from './components/TrackSummary.svelte';
	import { tracks } from './stores.js';
		
	tracks.useLocalStorage();
	
	let selectedTrack;
	let search = '';

	function addTrack() {
		tracks.addNew(search);
		selectedTrack = $tracks[$tracks.length -1];
		search = '';
	}

	function removeTrack(event) {
		selectedTrack = null;
		tracks.removeTrack(event.detail.id);
	}
	
	function selectTrack(track) {
		selectedTrack = track;
	}

	$: filteredTracks = $tracks.filter(t => 
			t.name.toLowerCase().includes(search.toLowerCase()) ||
			t.description.toLowerCase().includes(search.toLowerCase())		
		);
	
</script>


<div class="container is-fluid">
	{#if selectedTrack}
		<div>
			<button class="button" on:click="{() => selectedTrack = null }">
				Pick track
			</button>
			<Track on:removeTrack={removeTrack} track={selectedTrack} />		
		</div>
		
	{:else}
		<div class="panel">
			<div class="panel-heading">
				<p class="control has-icons-left">
					<input class="input" 
						bind:value={search}
						type="text" 
						placeholder="Search" >
					<span class="icon is-left">
						<i class="iconify" 
							data-icon="fa-solid:search" 
							data-inline="false" 
							aria-hidden="true"/>
					</span>
				</p>
				{#if search.length > 0}
					<button class="button" on:click={addTrack}>
						Create: {search}
					</button>
				{/if}
			</div>

			{#each filteredTracks as track}
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
