const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://myshop31.herokuapp.com',
            changeOrigin: true,
        }),
    );
};
