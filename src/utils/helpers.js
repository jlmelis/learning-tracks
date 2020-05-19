export const withHttps = url => !/^https?:\/\//i.test(url) ? `https://${url}` : url;
export const isEmpty = obj => Object.keys(obj).length === 0;
