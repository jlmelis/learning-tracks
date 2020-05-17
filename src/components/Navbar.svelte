<script>
  import { createEventDispatcher } from 'svelte';
  import About from './About.svelte';

  export let loggedIn = false;
  export let userName;

  const dispatch = createEventDispatcher();
  let src = '/images/LTLogo.png';
  let showMenu;

  //TODO: decide if the about component should live with the
  // navbar or the app component
  let showAbout;

  function toggleAbout() {
    showAbout = !showAbout;
  }
  
  function toggleMenu() {
    showMenu = !showMenu;
  }

  function login() {
    dispatch('login');
  }

  function logout() {
    dispatch('logout');
  }
</script>

<nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">    
    <div href="http://learning-tracks.netlify.com" id="logo">
      <img {src} alt="Learning Tracks Logo" width="300">
    </div>
    <button class="navbar-burger burger" 
      data-target="navMenu" 
      aria-label="menu" 
      aria-expanded="false"
      on:click={toggleMenu}
      class:is-active={showMenu}>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  </div>

  <div class="navbar-menu" id="navMenu" class:is-active={showMenu}>
    <div class="navbar-start">
      <a href="#" class="navbar-item" on:click={toggleAbout}>
        About
      </a>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        {#if !loggedIn}
          <button on:click={login} class="button is-light">
            <strong>Log In</strong>
          </button>
        {:else}
          <span>Hi {userName} </span>
          <button on:click={logout} class="button is-light">
            <strong>Log Out</strong>
          </button>
        {/if}
      </div>
    </div>
  </div>
</nav>


<About active={showAbout} on:cancel={toggleAbout}></About>