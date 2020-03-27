<script>
  import About from './About.svelte';

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
</script>

<style>
   
</style>

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
                <button class="button is-light">
                    <strong>Login</strong>
                </button>
            </div>
        </div>
    </div>
</nav>


<About active={showAbout} on:cancel={toggleAbout}></About>