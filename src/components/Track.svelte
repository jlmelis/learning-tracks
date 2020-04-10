<script>
  import { tick, createEventDispatcher } from 'svelte';
  import { selectTextOnFocus } from '../actions/inputActions.js';
  import { api } from '../utils.js';
  import TrackLink from './TrackLink.svelte';
  import Confirmation from './Confirmation.svelte';
  import AddLink from './AddLink.svelte';

  export let track;

  let edit;
  let nameInput;
  let showConfirmation;
  let showAddLink;

  const dispatch = createEventDispatcher();

  function removeTrack() {
    dispatch('removeTrack', { id: track.id });
  }

  async function editTrack() {
    edit = true;

    // using tick to wait for the input to be shown
    await tick();
    nameInput.focus();
  }

  function updateTrack() {
    //tracks.updateTrack(track);
    edit = false;
  }

  async function addLink(event) {
    const newLink = await api('create-link', {
      title: event.detail.linkTitle,
      url: event.detail.linkUrl,
      id: track.id,
    });

    track.links.data = [...track.links.data, newLink];
    toggleShowAddLink();
  }

  async function removeLink(event) {
    const deletedId = await api('delete-link', { id: event.detail.id });
    track.links.data = track.links.data.filter(t => t.id !== deletedId);
  }

  function onEnter(event) {
    if (event.key === 'Enter') {
      updateTrack();
    }
  }

  function toggleConfirmation() {
    showConfirmation = !showConfirmation;
  }

  function toggleShowAddLink() {
    showAddLink = !showAddLink;
  }
</script>

<div on:click class="panel">
  <div class="panel-heading">
    {#if edit}
      <div>
        <input class="input" bind:this={nameInput} 
          bind:value={track.name} 
          on:keydown={onEnter} 
          use:selectTextOnFocus/>
        <input class="input" 
          bind:value={track.description} 
          on:keydown={onEnter} 
          use:selectTextOnFocus/>
        <button class="button" on:click={updateTrack}>
          <i class="iconify" 
            data-icon="fa-solid:check" 
            data-inline="false"></i>
        </button>
      </div>
    {:else}
      <div on:dblclick={editTrack} class="level"> 
        <div class="level-left">
          <span>{track.name}</span>
          <span> ({track.description})</span>
          <i class="delete is-small" on:click={toggleConfirmation}></i>
        </div>
        <div class="level-right">
          <button class="button is-small" on:click={toggleShowAddLink}>
            <i class="iconify" 
              data-icon="fa-solid:plus" 
              data-inline="false"></i>
          </button>
        </div>
      </div>
    {/if}
  </div>
  {#if track.links}
    {#each track.links.data as link}
      <div class="panel-block">
        <TrackLink link={link} on:remove={removeLink} />
      </div> 
    {/each}
  {/if}
</div>

<AddLink active={showAddLink} 
  on:cancel={toggleShowAddLink} 
  on:save={addLink} />

<Confirmation active={showConfirmation} 
  message="{`Are you sure you want to delete the '${track.name}' track?`}"
  on:cancel={toggleConfirmation} 
  on:confirm={removeTrack} />
