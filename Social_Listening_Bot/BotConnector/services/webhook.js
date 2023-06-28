const axios = require('axios');
const moment = require('moment');
const { checkPageWorking, getAccessToken } = require('../utils');
const { MessageType } = require('../common/enum')

const { BOT_CONNECTOR_URL, BOT_URL } = process.env;

module.exports = {
    fbCommentSendToBot: async (value) => {
        try {
            const { from, post, post_id, comment_id, parent_id, message, created_time } = value;
            const botId = post_id.split('_')[0];
            if (await checkPageWorking(botId, MessageType.Comment)) {
                if (from.id !== botId) {
                    const PAGE_ACCESS_TOKEN = await getAccessToken(botId);

                    const resultInformationPost = await axios.get(
                        `${process.env.GRAPH_FACEBOOK_API}/v14.0/${post_id}?fields=message,created_time&access_token=${PAGE_ACCESS_TOKEN}`
                    );

                    const requestBody = {
                        text: message,
                        sender_id: from && from.id,
                        recipient_id: botId,
                        channel: 'facebook',
                        type_message: 'Comment',
                        service_url: BOT_CONNECTOR_URL,
                        metadata: {
                            post_id: post_id,
                            post_message: resultInformationPost.data.message,
                            post_created_time: resultInformationPost.data.created_time,
                            // moment().add(7, 'hours').toISOString(),
                            comment_id: comment_id,
                            parent_id: parent_id,
                            permalink_url: post.permalink_url,
                            comment_created_time: moment.unix(created_time).toISOString(),
                        },
                    };
                    // console.log('Message: ', requestBody);
                    const result = await axios.post(`${BOT_URL}/webhook/rasa`, requestBody);
                    return result.data;
                }
            }
            return;
        } catch (error) {
            console.log(error);
            console.log(error.message);
            return error.message;
        }
    },
    messengerSendToBot: async (value) => {
        try {
            const { sender, recipient, message, timestamp } = value;
            if (await checkPageWorking(recipient.id, MessageType.Message)) {
                const requestBody = {
                    text: message && message.text,
                    sender_id: sender && sender.id,
                    recipient_id: recipient && recipient.id,
                    channel: 'facebook',
                    type_message: 'Message',
                    message_id: message && message.mid,
                    parent_message_id: message && message.reply_to && message.reply_to.mid,
                    created_time: new Date(timestamp).toISOString(),
                    service_url: BOT_CONNECTOR_URL,
                };
                const result = await axios.post(`${BOT_URL}/webhook/rasa`, requestBody);
                console.log(result)
                return result.data;
            }
            return;
        } catch (error) {
            console.log(error);
            console.log(error.message);
            return error.message;
        }
    },
    whapsAppSendToBot: async (value) => {
        try {
            const { messaging_product, metadata, messages } = value;
            if (await checkPageWorking(metadata.phone_number_id)) {
                if (messages && messages.length) {
                    const requestBody = {
                        text: messages[0].text && messages[0].text.body,
                        sender_id: messages[0].from,
                        // recipient_id: metadata && metadata.display_phone_number,
                        recipient_id: metadata && metadata.phone_number_id,
                        channel: messaging_product || 'whatsapp',
                        type_message: 'Message',
                        service_url: BOT_CONNECTOR_URL,
                    };
                    // console.log('Message: ', requestBody);
                    const result = await axios.post(`${BOT_URL}/webhook/rasa`, requestBody);
                    return result.data;
                }
            }
            return;
        } catch (error) {
            console.log(error);
            console.log(error.message);
            return error.message;
        }
    },
    telegramSendToBot: async (value) => {
        try {
            const { from, chat, text } = value;
            if (await checkPageWorking(metadata.phone_number_id)) {
                if (from && !from.is_bot) {
                    const requestBody = {
                        text: text,
                        sender_id: from && from.id,
                        recipient_id: chat && chat.id,
                        channel: 'telegram',
                        type_message: 'Message',
                        service_url: BOT_CONNECTOR_URL,
                    };
                    // console.log('Message: ', requestBody);
                    const result = await axios.post(`${BOT_URL}/webhook/rasa`, requestBody);
                    return result.data;
                }
            }
            return;
        } catch (error) {
            console.log(error);
            console.log(error.message);
            return error.message;
        }
    },
};
