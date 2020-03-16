import { writable } from 'svelte/store';


function createTracks() {
	const { subscribe, set, update } = writable(
		[
			{
				id: 0,
				name: 'Svelte',
				description: 'Learning svelte',
				links: [
					{
						name: 'Official tutorial',
						href: 'https://svelte.dev/tutorial/basics'
					},
					{
						name: 'Scotch IO',
						href: 'https://svelte.dev/tutorial/basics'
					}
				]
			},
			{
				id: 1,
				name: 'Node',
				description: 'learning node',
				links: [
					{
						name: 'W3 Schools',
						href: 'https://www.w3schools.com/nodejs/'
					}
				]
			},	
		]
	);

	return {
		subscribe,
		addNew: () => update(n => [...n, {
			id: n.length,
			name: 'New Track', 
			description: 'learn something new!', 
			links: []}]),
		removeTrack: (id) => update(n => n.filter(t => t.id !== id)),
		updateTrack: (track) => update(n => n.map(t => t.id === track.id ? track : t))
	}
}

export const tracks = createTracks();

