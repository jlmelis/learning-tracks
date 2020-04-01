<script>
  import { createEventDispatcher } from 'svelte';
  import ToolTip from './ToolTip.svelte';
  import { withHttps } from '../utils.js';

  export let active;

  let error;
  let linkTitle = '';
  let linkUrl = '';
  let linkTitlePlaceholder = 'title';

  $: hasError = error && error.length > 0;

  $: disabled = hasError || linkTitle.length === 0 || linkUrl.length === 0;

  const dispatch = createEventDispatcher();

  function cancel() {
    reset();
    dispatch('cancel');
  }

  function save() {
    console.log(withHttps(linkUrl));
    dispatch('save', {
      linkUrl: withHttps(linkUrl),
      linkTitle: linkTitle,
    });
    reset();
  }

  function reset() {
    linkTitle = '';
    linkUrl = '';
    error = '';
  }

  function onUrlBlur() {
    if (linkUrl && linkUrl.length > 0) {
      linkTitlePlaceholder = 'loading....';
      getURLTitle();
    }
  }

  async function getURLTitle() {
    const encodedUrl = encodeURI(linkUrl);
    const result = await fetch(`/.netlify/functions/page-title?url=${encodedUrl}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Invalid url supplied');
        }
      })
      .catch(e => onError(e));
    
    if (result) {
      error = null;
      linkTitle = result.title;
      linkTitlePlaceholder = 'title';
    }
    
  }

  function onError(e) {
    error = e.message;
  }

</script>

<div class="modal" class:is-active={active}>
  <div class="modal-background" on:click={cancel}></div>
  <div class="modal-content">
    <div class="box">
      <h3 class="title">Add new link</h3>
      <ToolTip text={error} active={hasError}>
        <input class="input" class:is-danger={hasError} bind:value={linkUrl} on:blur={onUrlBlur} placeholder="url" />
      </ToolTip>

      <input class="input" bind:value={linkTitle} placeholder="{linkTitlePlaceholder}" />
      <button class="button is-primary" on:click={save} {disabled}>
        Save
      </button>
    </div>
  </div>
  <div class="modal-close is-large" aria-label="close" on:click={cancel}></div>
</div>