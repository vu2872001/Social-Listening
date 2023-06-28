let baseUrl = 'http://localhost:3000';
let webSocket = 'ws://localhost:3000';
let botUrl = 'http://localhost:8000';
const facebookGraph = 'https://graph.facebook.com';

let environment = {
  get baseUrl() {
    return baseUrl;
  },
  get webSocket() {
    return webSocket;
  },
  get botUrl() {
    return botUrl;
  },
  get facebookGraph() {
    return facebookGraph;
  },
  get auth() {
    return `${baseUrl}/auth`;
  },
  get user() {
    return `${baseUrl}/user`;
  },
  get role() {
    return `${baseUrl}/role`;
  },
  get permission() {
    return `${baseUrl}/permission`;
  },
  get notification() {
    return `${baseUrl}/notification`;
  },
  get socialNetwork() {
    return `${baseUrl}/socialNetwork`;
  },
  get socialGroup() {
    return `${baseUrl}/socialGroup`;
  },
  get socialMessage() {
    return `${baseUrl}/social-message`;
  },
  get socialPost() {
    return `${baseUrl}/social-post`;
  },
  get setting() {
    return `${baseUrl}/setting`;
  },
  get socialTabSetting() {
    return `${baseUrl}/socialTabSeting`;
  },
  get workflow() {
    return `${baseUrl}/workflow`;
  },
  get message() {
    return `${baseUrl}/message`;
  },
  get hotQueue() {
    return `${baseUrl}/hotqueue`;
  },
  get dashboard() {
    return `${baseUrl}/dashboard`;
  },
  get socialTab() {
    return `${baseUrl}/socialTab`;
  },
};

function updateBaseUrls(newBaseUrl, newBotUrl) {
  if (newBaseUrl) {
    baseUrl = newBaseUrl;
    webSocket = newBaseUrl.replace(/^https?:/, (match) =>
      match.startsWith('https') ? 'wss:' : 'ws:'
    );
  }

  if (newBotUrl) {
    botUrl = newBotUrl;
  }
}

export const gender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

export const role = [
  { label: 'Admin', value: 'ADMIN', color: 'red' },
  { label: 'Owner', value: 'OWNER', color: 'blue' },
  { label: 'Manager', value: 'MANAGER', color: 'green' },
  { label: 'Supporter', value: 'SUPPORTER', color: 'purple' },
];

export { updateBaseUrls };
export default environment;
