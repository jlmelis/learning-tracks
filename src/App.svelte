<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import Track from './components/Track.svelte';
  import TrackSummary from './components/TrackSummary.svelte';
  import api from './utils/api';
  import netlifyIdentity from 'netlify-identity-widget';

  let selectedTrack;
  let search = '';
  let tracks = [];

  let loggedIn = false;
  let userName = '';

  onMount(async () => {
    netlifyIdentity.init();
    tracks = await api.getAllTracks();
  });

  function login(){
    netlifyIdentity.open();
  }

  netlifyIdentity.on('login', async () => {
    const currentUser = await netlifyIdentity.currentUser();
    const token = await currentUser.jwt();
    userName = currentUser.user_metadata.full_name;
    loggedIn = true;
  });

  netlifyIdentity.on('logout', () => {
    loggedIn = false;
  });

  function logout() {
    netlifyIdentity.logout();
  }

  // TODO: make new component for tracklist
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

  function updateTrack(event) {
    // TODO: find a cleaner way of doing this
    const updatedTrack = event.detail.track;
    tracks = tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t);
    if (selectedTrack.id === updatedTrack.id) {
      selectedTrack = updatedTrack;
    }
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
  <Navbar on:login={login} on:logout={logout} {loggedIn} {userName}></Navbar>
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
        <Track on:removeTrack={removeTrack} on:updateTrack={updateTrack} track={selectedTrack} />		
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