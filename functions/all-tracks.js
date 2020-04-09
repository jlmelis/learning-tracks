import { query } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler() {
  const { tracks } = await query(gql`
    query {
      tracks {
        data {
          id: _id
          name
          description
        }
      }
    }
  `);

  return {
    statusCode: 200,
    body: JSON.stringify(tracks.data),
  };
}