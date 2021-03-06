<script>
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import netlifyIdentity from 'netlify-identity-widget';
  import { loggedInUser, isLoading } from '../stores';
  import { isEmpty } from '../utils/helpers';
  import Track from './Track.svelte';
  import TrackSummary from './TrackSummary.svelte';
  import api from '../utils/api';

  let search = '';
  let tracks = [];
  let selectedTab = 'all';

  // reactive variables
  let filterText;
  let loggedIn;
  let visibleTracks;
  let filteredTracks;

  $: {
    loggedIn = !isEmpty($loggedInUser);
    filterText = loggedIn ? 'filter or create new' : 'filter';
    visibleTracks = tracks.filter(t => {
      if (selectedTab === 'public') {
        return t.isPublic;
      } else if (selectedTab === 'mine') {
        return t.userEmail === $loggedInUser.email;
      } else {
        // This would be if 'all' is selected
        return true;
      }
    });
    filteredTracks = visibleTracks.filter(t =>
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
    
    let trackList = await api.getTrackList();
    // We only set the tracks collection here
    // if it hasn't been set as part of a login
    if (tracks.length === 0) {
      tracks = trackList;
    }
  });

  netlifyIdentity.on('login', async () =>{
    tracks = await api.getTrackList();
  });

  netlifyIdentity.on('logout', async () =>{
    tracks = await api.getTrackList();
    selectedTab = 'all';
  });

  async function addTrack() {
    isLoading.set(true);
    const newTrack = await api.createTrack(search, 'Learn something new!');
    tracks = [...tracks, newTrack];
    selectedTrack.set(tracks[tracks.length -1]);
    search = '';
    isLoading.set(false);
  }

  async function removeTrack(event) {
    isLoading.set(true);
    const deletedId = await api.deleteTrack(event.detail.id);
    tracks = tracks.filter(t => t.id !== deletedId);
    selectedTrack.set(null);
    isLoading.set(false);
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
    isLoading.set(true);
    const track = await api.getTrackById(id);
    selectedTrack.set(track);
    isLoading.set(false);
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
      {#if loggedIn}
        <p class="panel-tabs">
          <a class:is-active={selectedTab === 'all'} on:click={() => selectedTab = 'all'}>All</a>
          <a class:is-active={selectedTab === 'public'} on:click={() => selectedTab = 'public'}>Public</a>
          <a class:is-active={selectedTab === 'mine'} on:click={() => selectedTab = 'mine'}>My Tracks</a>
        </p>
      {/if}

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