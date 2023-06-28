const webhookRouter = require('./webhook');
const botRasaRouter = require('./botRasa');

const route = (app) => {
    app.use('/webhooks', webhookRouter);
    app.use('/rasa', botRasaRouter);
};

module.exports = route;
