exports.withHttps = url => !/^https?:\/\//i.test(url) ? `https://${url}` : url;