<script>
  import { createEventDispatcher } from 'svelte';
  import { loggedInUser } from '../stores';
  import { isEmpty } from '../utils/helpers';
  import Confirmation from './Confirmation.svelte';

  export let link;

  let showConfirmation;

  const dispatch = createEventDispatcher();

  $: loggedIn = !isEmpty($loggedInUser);

  function removeLink() {
    dispatch('remove', { id: link.id });
  }

  function toggleConfirmation() {
    showConfirmation = !showConfirmation;
  }
</script>

<div>
    <a href={link.url}>{link.title}</a>
    {#if loggedIn}
      <i class="delete is-small" on:click={toggleConfirmation}></i>
    {/if}
</div>

<Confirmation active={showConfirmation} 
  message="{`Are you sure you want to delete the '${link.title}' link?`}"
  on:cancel={toggleConfirmation} 
  on:confirm={removeLink} />