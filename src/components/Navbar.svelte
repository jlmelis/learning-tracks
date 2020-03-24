<script>
    import About from './About.svelte';

    let src = '/images/LTLogo.png';

    //TODO: decide if the about component should live with the 
    // navbar or the app component
    let showAbout;

    function toggleAbout() {
		showAbout = !showAbout;
	}
</script>

<nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">   
        <img {src} width="300" alt="Learning Tracks Logo">
    </div>

    <div class="navbar-menu is-active">
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


<About active={showAbout} on:cancel={toggleAbout} ></About>