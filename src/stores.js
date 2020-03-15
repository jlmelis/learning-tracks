import { writable } from 'svelte/store';


function createTracks() {
	const { subscribe, set, update } = writable(
		[
			{
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
			name: 'New Track', 
			description: 'learn something new!', 
			links: []}]),
	}
}

export const tracks = createTracks();

