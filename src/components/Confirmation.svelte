<script>
  import { createEventDispatcher } from 'svelte';

  export let active;
  export let message = 'Are you sure you want to delete?';

  const dispatch = createEventDispatcher();

  function cancel() {
    dispatch('cancel');
  }

  function confirm() {
    dispatch('confirm');
  }
</script>



<div class="modal" class:is-active={active}>
  <div class="modal-background" on:click="{cancel}"></div>
  <div class="modal-card">
    <header  class="modal-card-head">
      <div class="modal-card-title">Confirm delete</div>
      <button class="delete" aria-label="close" on:click="{cancel}"></button>
    </header>
    <section class="modal-card-body">
      {message}
    </section>
    <footer class="modal-card-foot">
      <button class="button is-danger" on:click="{confirm}">Confirm</button>
      <button class="button" on:click="{cancel}">Cancel</button>
    </footer>
  </div>
</div>