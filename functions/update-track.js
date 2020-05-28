import { mutate } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event, context) {
  try {
    const { user } = context.clientContext;

    if (!user) {
      throw new Error('Not Authorized');
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
    }

    const { id, name, description, isPublic } = JSON.parse(event.body);
    const userEmail = user.email;

    //TODO: Is returning the updated track the right way?
    const UPDATE_TRACK = gql`
      mutation ($id: ID!, $name: String!, $description: String, $userEmail: String!, $isPublic: Boolean!) {
        updateTrack(id: $id, data: {
          name: $name
          description: $description
          userEmail: $userEmail
          isPublic: $isPublic
        }) {
          id: _id
          name
          description
          userEmail
          isPublic
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

    const track = await mutate(UPDATE_TRACK, { id, name, description, userEmail, isPublic });
    
    return {
      statusCode: 200,
      body: JSON.stringify(track.updateTrack),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}