import { writable } from 'svelte/store';

function createTracks() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    set,
    addNew: (name) =>
      update((n) => [
        ...n,
        {
          id: n.length,
          name: name,
          description: 'learn something new!',
          links: [],
        },
      ]),
    removeTrack: (id) => update((n) => n.filter((t) => t.id !== id)),
    updateTrack: (track) =>
      update((n) => n.map((t) => (t.id === track.id ? track : t))),
  };
}

export const tracks = createTracks();
