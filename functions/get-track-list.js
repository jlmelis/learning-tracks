import { query } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event, context) {
  const { user } = context.clientContext;
  const userEmail = user ? user.email : null;

  const TRACKS_QUERY = gql`  
    query($userEmail: String) {
      trackList (userEmail: $userEmail) {
        data {
          id: _id
          name
          description
          userEmail
          public
        }
      }
    }
  `;

  const { trackList } = await query(TRACKS_QUERY, { userEmail });

  return {
    statusCode: 200,
    body: JSON.stringify(trackList.data),
  };
}