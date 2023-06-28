require('dotenv').config();
const express = require('express');
const { webhookController } = require('../controllers/index');

const webhookRouter = express.Router();

webhookRouter.get('/facebook', webhookController.subscribeWebhook);
webhookRouter.post('/facebook', webhookController.facebookSendToBot);
webhookRouter.post('/telegram', webhookController.telegramSendToBot);

module.exports = webhookRouter;
