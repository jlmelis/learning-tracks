import netlifyIdentity from 'netlify-identity-widget';

const BASE_URL ='/.netlify/functions/';

async function apiHelper(endpoint, body) {
  const currentUser = await netlifyIdentity.currentUser();
  let token = '';
  if (currentUser) {
    token = await currentUser.jwt();
  }
  
  const response = await fetch(BASE_URL + endpoint, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

const getTrackList = async () => {
  //const response = await fetch(BASE_URL + 'all-tracks');
  return await apiHelper('get-track-list', { id: '' });
};

const getTrackById = async (id) => {
  return await apiHelper('get-track', { id: id });
};

const createTrack = async (name, description) => {
  return await apiHelper('create-track', {
    name: name,
    description: description,
  });
};

const updateTrack = async (id, name, description, isPublic) => {
  return await apiHelper('update-track', {
    id: id,
    name: name,
    description: description,
    isPublic: isPublic,
  });
};

const deleteTrack = async (id) => {
  return await apiHelper('delete-track', { id: id });
};

const createLink = async (id, title, url) => {
  return await apiHelper('create-link', {
    title: title,
    url: url,
    id: id,
  });
};

const deleteLink = async (id) => {
  return await apiHelper('delete-link', { id: id });
};

const getPageTitle = async (url) => {
  const response = await fetch(BASE_URL + `page-title?url=${url}`);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Invalid url supplied');
  }
};

export default {
  getTrackList,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  createLink,
  deleteLink,
  getPageTitle,
};