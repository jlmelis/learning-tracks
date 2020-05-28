import { query } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
    }

    const { id } = JSON.parse(event.body);

    const GET_TRACK = gql`
      query ($id: ID!) {
        findTrackByID(id: $id) {
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

    const track = await query(GET_TRACK, { id });

    return {
      statusCode: 200,
      body: JSON.stringify(track.findTrackByID),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}