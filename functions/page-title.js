import cheerio from 'cheerio';
import axios from 'axios';

const withHttps = url => !/^https?:\/\//i.test(url) ? `https://${url}` : url;

export async function handler(event) {
  const url = withHttps(decodeURI(event.queryStringParameters.url));

  return axios.get(url,
    { headers: { 'User-Agent': 'Mozilla/5.0 (X11; CrOS x86_64 12739.105.0)\
     AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.158 Safari/537.36' },
   }).then((response) => {
    const $ = cheerio.load(response.data);

    return $('head > title').text();
  })
    .then(data => ({
      statusCode: 200,
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
      body: JSON.stringify({
        title: data,
      }),
    }))
    .catch(error => ({ statusCode: 404, body: String(error) }));
}