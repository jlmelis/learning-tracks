<script>
  import { onMount, getContext } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import TrackList from './components/TrackList.svelte';
  import netlifyIdentity from 'netlify-identity-widget';

  let selectedTrack;

  let loggedIn = false;
  let userName = '';

  onMount(async () => {
    selectedTrack = getContext('selectedTrack');
    netlifyIdentity.init();
  });

  function login(){
    netlifyIdentity.open();
  }

  netlifyIdentity.on('login', async () => {
    const currentUser = await netlifyIdentity.currentUser();
    //const token = await currentUser.jwt();
    userName = currentUser.user_metadata.full_name;
    loggedIn = true;
  });

  netlifyIdentity.on('logout', () => {
    loggedIn = false;
  });

  function logout() {
    netlifyIdentity.logout();
  }
</script>

<section class="section">
  <Navbar on:login={login} on:logout={logout} {loggedIn} {userName}></Navbar>
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