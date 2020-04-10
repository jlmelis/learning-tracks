import { mutate } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event){
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
    }

    const { id } = JSON.parse(event.body);

    const DELETE_TRACK = gql`
      mutation ($id: ID!) {
        deleteTrack(id: $id){
          id: _id
        }
      }
    `;

    const deletedId = await mutate(DELETE_TRACK, { id });

    return {
      statusCode: 200,
      body: JSON.stringify(deletedId.deleteTrack.id),
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}