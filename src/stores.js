import { writable } from 'svelte/store';

export const tracks = writable(
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