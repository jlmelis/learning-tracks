<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import Track from './components/Track.svelte';
  import TrackSummary from './components/TrackSummary.svelte';
  import api from './utils/api';

  let selectedTrack;
  let search = '';
  let tracks = [];

  onMount(async () => {
    tracks = await api.getAllTracks();
  });

  async function addTrack() {
    const newTrack = await api.createTrack(search, 'Learn something new!');
    tracks = [...tracks, newTrack];
    selectedTrack = tracks[tracks.length -1];
    search = '';
  }

  async function removeTrack(event) {
    const deletedId = await api.deleteTrack(event.detail.id);
    tracks = tracks.filter(t => t.id !== deletedId);
    selectedTrack = null;
  }

  async function selectTrack(id) {
    const track = await api.getTrackById(id);
    selectedTrack = track;
  }

  $: filteredTracks = tracks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase()),
  );
</script>

<section class="section">
  <Navbar></Navbar>
  {#if selectedTrack}
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><a href="#" on:click="{() => selectedTrack = null}">Tracks</a></li> 
        <li class="is-active"><a href ="#">{selectedTrack.name}</a></li>
      </ul>
    </nav>
  {/if}
</section>

<div>
  <div class="container is-fluid">
    {#if selectedTrack}
      <div>
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
            {#if search.length === 0}
              <span class="icon is-left">
                <i class="iconify" 
                  data-icon="fa-solid:search" 
                  data-inline="false" 
                  aria-hidden="true"></i>
              </span>
            {:else}
              <span class="icon is-left" on:click="{() => search = ''}">
                <i class="delete"></i>
              </span>
            {/if}
          </p>
          {#if search.length > 0}
            <button class="button" on:click={addTrack}>
            Create: {search}
            </button>
          {/if}
      </div>

      {#each filteredTracks as track}
        <div class="panel-block">
          <TrackSummary on:click={selectTrack(track.id)} 
          name={track.name} 
          description={track.description} />
        </div>
      {/each}
    </div>
    {/if}
  </div>
</div>