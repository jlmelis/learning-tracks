const BASE_URL ='/.netlify/functions/';

async function apiHelper(endpoint, body) {
  const response = await fetch(BASE_URL + endpoint, {
    method: 'post',
    body: JSON.stringify(body),
  });
  return await response.json();
}

const getAllTracks = async () => {
  const response = await fetch(BASE_URL + 'all-tracks');
  return await response.json();
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

const updateTrack = async (id, name, description) => {
  await apiHelper('update-track', {
    id: id,
    name: name,
    description: description,
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

export default {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  createLink,
  deleteLink,
};