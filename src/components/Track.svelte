<script>
  import { tick, createEventDispatcher } from 'svelte';
  import { selectTextOnFocus } from '../actions/inputActions.js';
  import { loggedInUser } from '../stores';
  import { isEmpty } from '../utils/helpers';
  import api from '../utils/api';
  import TrackLink from './TrackLink.svelte';
  import Confirmation from './Confirmation.svelte';
  import AddLink from './AddLink.svelte';

  export let track;

  let edit;
  let nameInput;
  let showConfirmation;
  let showAddLink;

  const dispatch = createEventDispatcher();

  $: canEdit = !isEmpty($loggedInUser) && $loggedInUser.email === track.userEmail;

  function removeTrack() {
    dispatch('removeTrack', { id: track.id });
  }

  async function editTrack() {
    if (!canEdit){
      return;
    }

    edit = true;

    // using tick to wait for the input to be shown
    await tick();
    nameInput.focus();
  }

  async function updateTrack() {
    const updatedTrack = await api.updateTrack(track.id, track.name, track.description, track.isPublic);
    edit = false;
    dispatch('updateTrack', { track: updatedTrack });
  }

  async function addLink(event) {
    const optimisticLink = {
      title: event.detail.linkTitle,
      url: event.detail.linkUrl,
    };

    track.links.data = [...track.links.data, optimisticLink];
    toggleShowAddLink();

    try {
      const newLink = await api.createLink(track.id, event.detail.linkTitle, event.detail.linkUrl);
      track.links.data = track.links.data.map(l => l === optimisticLink ? newLink : l);
    } catch (error) {
      // TODO: Handle failure
    }
  }

  async function removeLink(event) {
    const deletedLink = track.links.data.find(l => l.id === event.detail.id);
    
    track.links.data = track.links.data.filter(l => l.id !== deletedLink.id);

    try {
      await api.deleteLink(deletedLink.id);
    } catch (error) {
      // TODO: Handle failure
    }
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

  function togglePublic() {
    track.isPublic = !track.isPublic;
    updateTrack();
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
          {#if canEdit}
            <i class="delete is-small" on:click={toggleConfirmation}></i>
          {/if}
        </div>
        {#if canEdit}
          <div class="level-right">
            <button class="button is-small" on:click={toggleShowAddLink}>
              <i class="iconify" 
                data-icon="fa-solid:plus" 
                data-inline="false"></i>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  {#if canEdit}
    <div class="panel-block">
      <div on:click={togglePublic}>
        {#if track.isPublic}
          <span class="toggleContainer">
            <i class="iconify isPublic toggle" 
            data-icon="fa-solid:toggle-on" 
            data-inline="false"></i>
            Make private
          </span>      
        {:else}
          <span class="toggleContainer">
            <i class="iconify toggle" 
            data-icon="fa-solid:toggle-off" 
            data-inline="false"></i>
            Make public
          </span>    
        {/if}
      </div>    
    </div>
  {/if}
  {#if track.links}
    {#each track.links.data as link}
      <div class="panel-block">
        <TrackLink link={link} on:remove={removeLink} {canEdit} />
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

  <style>
    .isPublic {
      color:lawngreen;
    }
    .toggle {
      height: 1.5em;
      width: 1.5em;
      margin-right: .5em;
    }
    .toggleContainer {
      display: inline-flex;
      align-items: center;
    }
  </style>