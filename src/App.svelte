<script>
  import { onMount, getContext } from 'svelte';
  import { loggedInUser } from './stores';
  import Navbar from './components/Navbar.svelte';
  import LoadingBar from './components/LoadingBar.svelte';
  import TrackList from './components/TrackList.svelte';
  import netlifyIdentity from 'netlify-identity-widget';

  let selectedTrack;

  onMount(async () => {
    selectedTrack = getContext('selectedTrack');
    netlifyIdentity.init();
  });

  //TODO: decide if the login logic should stay here or move to the navbar/another component
  function login(){
    netlifyIdentity.open();
  }

  netlifyIdentity.on('login', async () => {
    loggedInUser.set(await netlifyIdentity.currentUser());
  });

  netlifyIdentity.on('logout', () => {
    loggedInUser.set({});
  });

  function logout() {
    netlifyIdentity.logout();
  }
</script>

<section class="section">
  <Navbar on:login={login} on:logout={logout}></Navbar>
  {#if $selectedTrack}
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><a href="#" on:click="{() => selectedTrack.set(null)}">Tracks</a></li> 
        <li class="is-active"><a href ="#">{$selectedTrack.name}</a></li>
      </ul>
    </nav>
  {/if}
</section>

<TrackList></TrackList>

<LoadingBar></LoadingBar>
