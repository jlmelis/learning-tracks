// Simple proxy server to allow testing netlify
// functions via a Svelte frontend
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/.netlify/functions',
  createProxyMiddleware({ target: 'http://localhost:9000', changeOrigin: true }));

app.use('/',
  createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true }));

app.listen(process.env.PORT || 3000);
console.log('proxy is running');