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
    
    const { name, description } = JSON.parse(event.body);
    const userEmail = user.email;

    const CREATE_TRACK = gql`
      mutation ($name: String!, $description: String, $userEmail: String!) {
        createTrack(data: {
          name: $name
          description: $description
          userEmail: $userEmail
          isPublic: false
        })
        {
          id: _id
          name
          description
          userEmail
          isPublic
          links {
            data {
              _id
            }
          }
        }
      }
    `;
    
    const track = await mutate(CREATE_TRACK, { name, description, userEmail });
    
    return {
      statusCode: 201,
      body: JSON.stringify(track.createTrack),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}