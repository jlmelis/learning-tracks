import { mutate } from './util/graphql';
import { gql } from 'apollo-boost';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
    }

    const { title, url, id } = JSON.parse(event.body);
    
    const CREATE_LINK = gql`
      mutation ($title: String!, $url: String!, $id: ID!) {
        createLink(data: {
          title: $title
          url: $url
          track: { connect: $id}
        }) {
          id: _id
          title
          url
        }
      }
    `;

    const link = await mutate(CREATE_LINK, { title, url, id });
    
    return {
      statusCode: 201,
      body: JSON.stringify(link.createLink),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}