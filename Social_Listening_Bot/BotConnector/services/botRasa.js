const axios = require('axios');
const moment = require('moment');

require('dotenv').config();

const { BOT_CONNECTOR_URL, BOT_URL, PAGE_ACCESS_TOKEN, TELEGRAM_TOKEN } = process.env;

module.exports = {
    replyMessage: async (message) => {
        try {
            let result;
            if (message && message.channel && message.type_message) {
                if (message.channel.toLowerCase() === 'facebook') {
                    if (message.type_message.toLowerCase() === 'message') {
                        const requestBody = {
                            recipient: {
                                id: message.recipient_id,
                            },
                            message: { text: message.text },
                        };
                        result = await axios.post(
                            `${process.env.GRAPH_FACEBOOK_API}/v14.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
                            requestBody
                        );
                    }
                    if (message.type_message.toLowerCase() === 'comment' && message.metadata) {
                        const requestBody = {
                            message: message.text,
                        };
                        result = await axios.post(
                            `${process.env.GRAPH_FACEBOOK_API}/v14.0/${message.metadata.comment_id}/comments?access_token=${PAGE_ACCESS_TOKEN}`,
                            requestBody
                        );

                        await axios.post(`${BOT_URL}/save-message-bot`, {
                            text: message.text,
                            sender_id: message.sender_id,
                            recipient_id: message.recipient_id,
                            channel: message.channel,
                            type_message: message.type_message,
                            service_url: BOT_CONNECTOR_URL,
                            metadata: {
                                post_id: message.metadata.post_id,
                                post_message: message.metadata.post_message,
                                post_created_time: message.metadata.post_created_time,
                                permalink_url: message.metadata.permalink_url,
                                comment_id: result.data.id,
                                parent_id: message.metadata.comment_id,
                                comment_created_time: new Date().toISOString(),
                            },
                        });
                    }
                }
                if (message.channel.toLowerCase() === 'whatsapp') {
                    if (message.type_message && message.type_message.toLowerCase() === 'message') {
                        const requestBody = {
                            to: message.recipient_id,
                            text: { body: message.text },
                            messaging_product: 'whatsapp',
                            type: 'text',
                        };

                        result = await axios.post(
                            `${process.env.GRAPH_FACEBOOK_API}/v16.0/${message.sender_id}/messages`,
                            requestBody,
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${PAGE_ACCESS_TOKEN}`,
                                },
                            }
                        );
                    }
                }
                if (message.channel.toLowerCase() === 'telegram') {
                    if (message.type_message && message.type_message.toLowerCase() === 'message') {
                        const requestBody = {
                            chat_id: message.from,
                            text: 'Hello, World!',
                        };
                        result = await axios.post(
                            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
                            requestBody
                        );
                    }
                }
            }
            console.log('Message id successfully:', result.data);
            return result;
        } catch (error) {
            console.log(error);
            console.log(error.message);
            return error.message;
        }
    },
};
