<script>
	import { onMount } from 'svelte';
	import Navbar from './components/Navbar.svelte';
	import Track from './components/Track.svelte';
	import TrackSummary from './components/TrackSummary.svelte';
	import { tracks } from './stores.js';

	//TODO: remove or find better 
	//being used to reset local storage if breaking changes are made
	//in development
	onMount(() => {
		let json = localStorage.getItem('tracksLastUpdate');
		let updateVer = 2;
		if (!json || json != updateVer) {
			localStorage.setItem('tracksLastUpdate', updateVer);
			localStorage.removeItem('tracks');
		} 

		tracks.useLocalStorage();	
	});
	
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

<section class="section">
	<Navbar></Navbar>
</section>


<div class="section">
	<div class="container is-fluid">
		{#if selectedTrack}
			<div>
				<button class="button" on:click="{() => selectedTrack = null}">
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
							placeholder="filter or create new" >
						<span class="icon is-left">
							<i class="iconify" 
								data-icon="fa-solid:search" 
								data-inline="false" 
								aria-hidden="true"></i>
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
							active={selectedTrack === track}
							name={track.name} 
							description={track.description} />
					</div>	
				{/each}
			</div>
	
		{/if}
	</div>
</div>