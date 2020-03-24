<script>
    import { createEventDispatcher } from 'svelte';

    export let active;

    const dispatch = createEventDispatcher();

    function cancel() {
        dispatch('cancel');
    }
</script>

<div class="modal" class:is-active={active}>
    <div class="modal-background" on:click={cancel}></div>
    <div class="modal-content">

        <div class="box">
            <h3 class="title">Credits: </h3>
            Created my free logo at <a href="https://my.logomakr.com/">LogoMakr.com</a>
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close" on:click={cancel}></button>
</div>