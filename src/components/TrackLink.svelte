<script>
    import { createEventDispatcher } from 'svelte';
    import Confirmation from './Confirmation.svelte';

    export let link;

    let showConfirmation;

    const dispatch = createEventDispatcher();

    function removeLink() {
        dispatch('remove', {id: link.id});
    }

    function toggleConfirmation() {
        showConfirmation = !showConfirmation;
    }

</script>

<div>
    <a href='{link.href}'>{link.title}</a>
    <button class="button is-small" on:click={toggleConfirmation}>
        <i class="iconify"
            data-icon="fa-solid:trash"
            data-inline="false"></i>
    </button>
</div>

<Confirmation active="{showConfirmation}" 
    message="{`Are you sure you want to delete the '${link.title}' link?`}"
	on:cancel="{toggleConfirmation}" 
	on:confirm="{removeLink}" />