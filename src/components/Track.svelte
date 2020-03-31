<script>
	import { tick, createEventDispatcher } from 'svelte';
	import { tracks } from '../stores.js';
	import { selectTextOnFocus } from '../actions/inputActions.js';
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
	  tracks.updateTrack(track);
	  edit = false;
	}

	function addLink(event) {
	  // TODO: is this causing two renders?
	  // look into possibility of using storefunction to update store
	  // as opposed to updating item then updating store.
    track.links = [...track.links,{
        id: track.links.length + 1,
        title: event.detail.linkTitle,
        url: event.detail.linkUrl,
      }];
	  tracks.updateTrack(track);
	  toggleShowAddLink();
	}

	function removeLink(event) {
	  // TODO: is this causing two renders?
	  // look into possibility of using storefunction to update store
	  // as opposed to updating item then updating store.
	  track.links = track.links.filter(t => t.id !== event.detail.id);
	  tracks.updateTrack(track);
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
				<input class="input" bind:this={nameInput} 
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
		{#each track.links as link}
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
