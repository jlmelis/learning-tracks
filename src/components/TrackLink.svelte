<script>
  import { createEventDispatcher } from 'svelte';
  import Confirmation from './Confirmation.svelte';

  export let link;

  let showConfirmation;

  const dispatch = createEventDispatcher();

  function removeLink() {
    dispatch('remove', { id: link.id });
  }

  function toggleConfirmation() {
    showConfirmation = !showConfirmation;
  }

</script>

<div>
    <a href={link.url}>{link.title}</a>
    <i class="delete is-small" on:click={toggleConfirmation}></i>
</div>

<Confirmation active={showConfirmation} 
    message="{`Are you sure you want to delete the '${link.title}' link?`}"
	on:cancel={toggleConfirmation} 
	on:confirm={removeLink} />