const axios = require('axios');
const { WEB_PAGE_URL, API_KEY } = process.env;


module.exports = {
    checkPageWorking: async (pageID, typeMessage) => {
        try {
            console.log(pageID, typeMessage)
            const result = await axios.get(`${WEB_PAGE_URL}/socialTab/${pageID}/working/type/${typeMessage}`, {
                headers: { Authorization: API_KEY },
            });
            console.log(result.data.result)
            return result.data.result;
        } catch (e) {
            console.log(e.message);
            return e.message;
        }
    },
    getAccessToken: async (pageID) => {
        try {
            const result = await axios.get(`${WEB_PAGE_URL}/socialTab/${pageID}/accessToken`, {
                headers: { Authorization: API_KEY },
            })
            return result.data.result;
        }
        catch (error) {
            console.log(error.message);
            return error.message;
        }
    }
};
