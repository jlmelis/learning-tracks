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
						id: 0,
						title: 'Official tutorial',
						href: 'https://svelte.dev/tutorial/basics'
					},
					{
						id: 1,
						title: 'Scotch IO',
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
						id: 0,
						title: 'W3 Schools',
						href: 'https://www.w3schools.com/nodejs/'
					}
				]
			},	
		]
	);

	return {
		subscribe,
		set,
		useLocalStorage: () => {
			const json = localStorage.getItem('tracks');
			
			if (json) {
				set(JSON.parse(json));
			}

			subscribe(current => {
				localStorage.setItem('tracks', JSON.stringify(current));
			});
		},
		addNew: (name) => update(n => [...n, {
			id: n.length,
			name: name, 
			description: 'learn something new!', 
			links: []}]),
		removeTrack: (id) => update(n => n.filter(t => t.id !== id)),
		updateTrack: (track) => update(n => n.map(t => t.id === track.id ? track : t))
	}
}

export const tracks = createTracks();

