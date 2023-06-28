const { webhookService } = require('../services/index');
const { VERIFY_TOKEN } = process.env;

module.exports = {
    subscribeWebhook: (req, res) => {
        // Parse the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];
        // Check if a token and mode is in the query string of the request
        if (mode && token) {
            // Check the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                // Respond with the challenge token from the request
                console.log('Subscribe webhook successfully');
                return res.status(200).send(challenge);
            } else {
                // Respond with '403 Forbidden' if verify tokens do not match
                return res.sendStatus(403);
            }
        }
    },

    facebookSendToBot: async (req, res) => {
        try {
            let body = req.body;
            if (body.object === 'page') {
                // Iterate over each entry - there may be multiple if batched
                body.entry.forEach(async (entry) => {
                    // Gets the body of the webhook event
                    const value =
                        (entry.changes && entry.changes[0].value) ||
                        (entry.messaging && entry.messaging[0]);
                    if (value && value.comment_id && value.message) {
                        await webhookService.fbCommentSendToBot(value);
                    } else if (value && value.sender && value.recipient && value.message) {
                        await webhookService.messengerSendToBot(value);
                    }
                });
                // Return a '200 OK' response to all events
                return res.status(200).send('EVENT_RECEIVED');
            } else if (body.object === 'whatsapp_business_account') {
                body.entry.forEach(async (entry) => {
                    if (entry && entry.changes && entry.changes.length > 0) {
                        const value = entry.changes[0].value;
                        // console.log('value', value);
                        if (
                            entry.changes[0].field === 'messages' &&
                            value.messages &&
                            value.messages.length
                        ) {
                            await webhookService.whapsAppSendToBot(value);
                        }
                    }
                });
                return res.sendStatus(200);
                // } else if (body.object === 'instagram') {
                //     console.log(body.entry[0].changes);
                //     return res.sendStatus(404);
            } else {
                // Return a '404 Not Found' if event is not from a page subscription
                return res.sendStatus(404);
            }
        } catch (error) {
            return res.status(500).send(error.message);
        }
    },

    telegramSendToBot: async (req, res) => {
        try {
            let body = req.body;
            if (body && body.message) {
                await webhookService.telegramSendToBot(body.message);
                return res.sendStatus(200);
            } else {
                return res.sendStatus(400);
            }
        } catch (error) {
            return res.status(500).send(error.message);
        }
    },
};
