<script>
    let src = 'images/LTLogo.png';

    console.log('in navbar: ' + src);
</script>



<nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item">
            <image {src} width="300" alt="Learning Tracks Logo"></image>
        </a>
        
    </div>

    <div class="navbar-menu is-active">
        <div class="navbar-start">
            <a class="navbar-item">
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