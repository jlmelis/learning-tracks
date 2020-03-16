<script>
    import { createEventDispatcher } from 'svelte';

    export let id; 
    export let name;
    export let description;
    export let active;

    const dispatch = createEventDispatcher();

    function removeTrack() {
        dispatch('removeTrack', {id: id});
    }
</script>

<style>
    .summary {
        margin-top: 10px;
        cursor: pointer;
    }

    .desription {
        margin-left: 10px;
        font-style: italic;
    }

    .active {
        color: cornflowerblue;
    }

    button {
		font-size: 100%;
		font-family: inherit;
		border: 0;
		padding: 0;
		background: none;
	}

    .iconify {
		cursor: pointer;
		color: grey;
	}

	.iconify:hover {
		color: black;
	}
</style>

<div class="summary" class:active on:click> 
    <div>
        <span>{name}</span>
        <button on:click={removeTrack}>
            <span class="iconify" 
                data-icon="ic:twotone-delete" 
                data-inline="false"></span>
        </button>
    </div>
    <div class="desription">
        {description}
    </div>
    
</div>