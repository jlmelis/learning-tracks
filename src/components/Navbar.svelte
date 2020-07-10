<script>
  import { createEventDispatcher } from 'svelte';
  import { loggedInUser } from '../stores';
  import { isEmpty } from '../utils/helpers';
  import About from './About.svelte';

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
    <a href="https://learning-tracks.netlify.app" id="logo">
      <img {src} alt="Learning Tracks Logo" width="300">
    </a>
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
      <a href="https://github.com/jlmelis/learning-tracks" class="navbar-item" target="_blank">
        <span class="iconify icon" data-icon="ant-design:github-filled" data-inline="false"></span>
      </a>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        {#if isEmpty($loggedInUser)}
          <button on:click={login} class="button is-light">
            <strong>Log In</strong>
          </button>
        {:else}
          <span>Hi {$loggedInUser.user_metadata.full_name} ({$loggedInUser.email})</span>
          <button on:click={logout} class="button is-light">
            <strong>Log Out</strong>
          </button>
        {/if}
      </div>
    </div>
  </div>
</nav>


<About active={showAbout} on:cancel={toggleAbout}></About>