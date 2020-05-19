import { query } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event, context) {
  const { user } = context.clientContext;
  const userEmail = user ? user.email : '';

  const TRACK_FIELDS_FRAGMENT = gql`
    fragment trackFields on Track {
      id: _id
      name
      description
      userEmail
      public
    }
  `;

  const TRACKS_QUERY = gql`  
    query ($userEmail: String!) {
      tracksByUserEmail(userEmail: $userEmail) {
        data {
          ...trackFields
        }
      }
      tracksByPublicFlag(public: true) {
        data {
          ...trackFields
        }
      }
    }
    ${TRACK_FIELDS_FRAGMENT}
  `;

  const tracks = await query(TRACKS_QUERY, { userEmail });

  // combine tracks into one array
  // TODO: need to distinguish between public and owned.
  // may need to pas both arrays separately
  let tracksByUserEmail = tracks.tracksByUserEmail.data;
  let tracksByPublicFlag = tracks.tracksByPublicFlag.data;
  let results = tracksByUserEmail.concat(tracksByPublicFlag);

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
}