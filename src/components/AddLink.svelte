<script>
  import { createEventDispatcher, tick } from 'svelte';
  import ToolTip from './ToolTip.svelte';
  import { withHttps } from '../utils/helpers';
  import api from '../utils/api';
  
  export let active;

  let error;
  let linkTitle = '';
  let linkUrl = '';
  let linkTitlePlaceholder = 'title';
  let urlInput;

  $: hasError = error && error.length > 0;

  $: disabled = hasError || linkTitle.length === 0 || linkUrl.length === 0;

  $: fullUrl = withHttps(linkUrl);

  $: if (active) {
    focusUrlInput();
  }

  const dispatch = createEventDispatcher();

  async function focusUrlInput() {
    await tick();
    urlInput.focus();
  }

  function cancel() {
    reset();
    dispatch('cancel');
  }

  function save() {
    dispatch('save', {
      linkUrl: fullUrl,
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

  function onKeyDown(event) {
    if (event.key === 'Enter' && !disabled) {
      save();
    } else if (event.key === 'Escape') {
      cancel();
    }
  }

  async function getURLTitle() {
    const encodedUrl = encodeURI(fullUrl);
    try {
      const result = await api.getPageTitle(encodedUrl);
      error = null;
      linkTitle =result.title;
      linkTitlePlaceholder = 'title';
    } catch (error) {
      onError(error);
    }
  }

  function onError(e) {
    error = e.message;
  }
  
</script>

<div class="modal" class:is-active={active} on:keydown={onKeyDown} tabindex="0">
  <div class="modal-background" on:click={cancel}></div>
  <div class="modal-content">
    <div class="box">
      <h3 class="title">Add new link</h3>
      <ToolTip text={error} active={hasError}>
        <input bind:this={urlInput} class="input" class:is-danger={hasError} bind:value={linkUrl} 
        on:blur={onUrlBlur}  placeholder="url" />
      </ToolTip>

      <input class="input" bind:value={linkTitle} placeholder="{linkTitlePlaceholder}" />
      <button class="button is-primary" on:click={save} {disabled}>
        Save
      </button>
    </div>
  </div>
  <div class="modal-close is-large" aria-label="close" on:click={cancel}></div>
</div>

<style>
  .title {
    cursor: default;
  }
</style>