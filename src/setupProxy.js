const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api1',
    createProxyMiddleware({
      target: 'http://127.0.0.1:6000',
      changeOrigin: true,
      pathRewrite: { '^/api1': '' },
    })
  );

  app.use(
    '/api2',
    createProxyMiddleware({
      target: 'https://express-and-react.vercel.app',
      changeOrigin: true,
      pathRewrite: { '^/api2': '' },
    })
  );
};
