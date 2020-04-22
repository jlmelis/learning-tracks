export const withHttps = url => !/^https?:\/\//i.test(url) ? `https://${url}` : url;

// export async function api(endpoint, body) {
//   const res = await fetch(`/.netlify/functions/${endpoint}`, {
//     method: 'post',
//     body: JSON.stringify(body),
//   });
  
//   return await res.json();
// }