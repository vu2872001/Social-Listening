require('dotenv').config();
const express = require('express');
const { botRasaController } = require('../controllers/index');

const botRasaRouter = express.Router();

botRasaRouter.post('/bot', botRasaController.callSendMsg);
botRasaRouter.post('/conversations/activities', botRasaController.callSendMsg);
botRasaRouter.post('/training-result', botRasaController.trainingResult);

module.exports = botRasaRouter;
