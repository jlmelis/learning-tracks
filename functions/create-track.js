import { mutate } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
    }
    
    const { name, description } = JSON.parse(event.body);

    const CREATE_TRACK = gql`
      mutation ($name: String!, $description: String) {
        createTrack(data: {
          name: $name
          description: $description
        })
        {
          id: _id
          name
          description
          links {
            data {
              _id
            }
          }
        }
      }
    `;
    
    const track = await mutate(CREATE_TRACK, { name, description });
    
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