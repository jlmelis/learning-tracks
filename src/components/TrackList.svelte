<script>
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { loggedInUser } from '../stores';
  import { isEmpty } from '../utils/helpers';
  import Track from './Track.svelte';
  import TrackSummary from './TrackSummary.svelte';
  import api from '../utils/api';

  let search = '';
  let tracks = [];

  // reactive variables
  let filterText;
  let loggedIn;
  let filteredTracks;

  $: {
    loggedIn = !isEmpty($loggedInUser);
    filterText = loggedIn ? 'filter or create new' : 'filter';
    filteredTracks = tracks.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // Using a writable store in the context to share
  // the selected track, and updates, with the parent component.
  // Currently the parent componet (i.e. app) is the only component
  // that needs this information otherwise a plain store may be more appropriate.
  let selectedTrack = writable(null);

  onMount(async () => {
    setContext('selectedTrack', selectedTrack);
    tracks = await api.getAllTracks();
  });

  async function addTrack() {
    const newTrack = await api.createTrack(search, 'Learn something new!');
    tracks = [...tracks, newTrack];
    selectedTrack.set(tracks[tracks.length -1]);
    search = '';
  }

  async function removeTrack(event) {
    const deletedId = await api.deleteTrack(event.detail.id);
    tracks = tracks.filter(t => t.id !== deletedId);
    selectedTrack.set(null);
  }

  function updateTrack(event) {
    // TODO: find a cleaner way of doing this
    const updatedTrack = event.detail.track;
    tracks = tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t);
    if ($selectedTrack.id === updatedTrack.id) {
      selectedTrack.set(updatedTrack);
    }
  }

  async function selectTrack(id) {
    const track = await api.getTrackById(id);
    selectedTrack.set(track);
  }
</script>

<div>
  <div class="container is-fluid">
    {#if $selectedTrack}
      <div>
        <Track on:removeTrack={removeTrack} on:updateTrack={updateTrack} track={$selectedTrack} />		
      </div>			
    {:else}
      <div class="panel">
        <div class="panel-heading">
          <p class="control has-icons-left">
            <input class="input" 
            bind:value={search}
            type="text" 
            placeholder={filterText} >
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
          {#if search.length > 0 && loggedIn}
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