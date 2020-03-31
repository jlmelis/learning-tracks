<script>
	import { tick, createEventDispatcher } from 'svelte';
	import { tracks } from '../stores.js';
	import { selectTextOnFocus } from '../actions/inputActions.js';
	import TrackLink from './TrackLink.svelte';
	import Confirmation from './Confirmation.svelte';

	export let track;
	
	let edit;
	let nameInput;
	let linkTitle;
  let linkUrl;
  let linkTitlePlaceholder = 'title';
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

	function addLink() {
	  // TODO: is this causing two renders?
	  // look into possibility of using storefunction to update store
	  // as opposed to updating item then updating store.
	  track.links = [...track.links, { id: track.links.length + 1, title: linkTitle, url: linkUrl }];
	  tracks.updateTrack(track);
	  linkTitle = '';
	  linkUrl = '';
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

  //TODO: Move to component
  function onUrlBlur() {
    linkTitlePlaceholder = 'loading....';
    getURLTitle();
  }

  async function getURLTitle() {
    const encodedUrl = encodeURI(linkUrl);
    const response = await fetch(`/.netlify/functions/page-title?url=${encodedUrl}`);
    const result = await response.json();
    
    linkTitle = result.title;
    linkTitlePlaceholder = 'title';
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

<!-- TODO: Move to component-->
<div class="modal" class:is-active={showAddLink}>
	<div class="modal-background" on:click={toggleShowAddLink}></div>
	<div class="modal-content">
		<div class="box">
			<h3 class="title">Add new link</h3>
      <input class="input" bind:value={linkUrl} on:blur={onUrlBlur} placeholder="url" />
      <input class="input" bind:value={linkTitle} placeholder="{linkTitlePlaceholder}" />
			<button class="button is-primary" on:click={addLink}>
				Save
			</button>
		</div>
	</div>
	<div class="modal-close is-large" aria-label="close" on:click={toggleShowAddLink}></div>
</div>

<Confirmation active={showConfirmation} 
	message="{`Are you sure you want to delete the '${track.name}' track?`}"
	on:cancel={toggleConfirmation} 
	on:confirm={removeTrack} />
