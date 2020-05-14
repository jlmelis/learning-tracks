import { mutate } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
    }

    const { id, name, description } = JSON.parse(event.body);

    //TODO: Is returning the updated track the right way?
    const UPDATE_TRACK = gql`
      mutation ($id: ID!, $name: String!, $description: String) {
        updateTrack(id: $id, data: {
          name: $name
          description: $description
        }) {
          id: _id
          name
          description
          links {
            data {
              id: _id
              title
              url
            }
          }
        }
      }
    `;

    const track = await mutate(UPDATE_TRACK, { id, name, description });
    
    return {
      statusCode: 201,
      body: JSON.stringify(track.updateTrack),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}