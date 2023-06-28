import asyncio
import concurrent.futures
import datetime

from core.config import settings
from helper.httpMethod import PostMethod
from helper.getSetting import get_setting
from helper.execAsyncFunction import async_function_executor

async def reply_facebook_message_thread(message: any):
	with concurrent.futures.ThreadPoolExecutor() as executor:
		future = executor.submit(async_function_executor, reply_facebook_message, message=message)
		return await asyncio.wrap_future(future)

async def reply_facebook_message(message: any):
  print(message)
  dialogflow_data =message.get("replyInfo").get("dialogFlow")
  agent_id = list(dialogflow_data.keys())[0]
  list_response_intent = dialogflow_data.get(agent_id)
  notify_agent = message.get('replyInfo').get('notifyAgent')
  
  DIALOGFLOW_KEY = await get_setting('DIALOGFLOW_KEY', 'GOOGLE_API')
  DIALOGFLOW_LOCATION = await get_setting('DIALOGFLOW_LOCATION', 'GOOGLE_API')
  
  intent_detect = await PostMethod(
    domain = settings.DIALOGFLOW_ENDPOINT,
    endpoint = "/detect-intent/projects/{0}/locations/{1}/agents/{2}/sessions/{3}".format(DIALOGFLOW_KEY, DIALOGFLOW_LOCATION, agent_id, message.get('messageId')),
    body = {
      "text": message.get("message"),
      "language_code": "en"
    }
  )
  intent_data = intent_detect.json()
  intent_id = intent_data.get("intent").split('/')[-1]
  response_intent = find_data(list_response_intent, intent_id, notify_agent)
  # print(response_intent)

  if response_intent is not None:
    if message.get('messageType') == 'Comment':
      response = await PostMethod(
        domain = 'https://graph.facebook.com',
        endpoint = "/{0}/comments?access_token={1}".format(message.get('fb_message_id'), message.get('token')),
        body = {
          "message": response_intent.get("respond")
        },
      )
      fb_response = response.json()
      
      now = datetime.datetime.now()
      iso_time = now.isoformat()

      comment_info = {
        "networkId": message.get("pageId"),
        "message": response_intent.get("respond"),
        "sender": {
          "id": message.get("pageId"),
          "name": message.get("pageName"),
          "avatar": message.get("avatarUrl")
        },
        "createdAt": iso_time,
        "type": 'Bot',
        "parent": {
          "postId": message.get("postId"),
          "message": None,
          "permalinkUrl": None,
          "createdAt": None
        },
        "sentiment": None,
        "postId": message.get("postId"),
        "commentId": fb_response.get("id"),
        "parentId": message.get("fb_message_id")
      }
      
      backend_auth_header = {
        'Authorization': settings.BACKEND_AUTH_HEADER
      }
      response_save_comment = await PostMethod(
        domain = settings.BACKEND_ENPOINT, 
        endpoint = "/social-message/save", 
        body = comment_info, 
        headers = backend_auth_header
      )
      print("Response save comment: ", response_save_comment)
    elif message.get('messageType') == 'Message':
      response = await PostMethod(
        domain = 'https://graph.facebook.com/v16.0',
        endpoint = "/{0}/messages?access_token={1}".format(message.get('pageId'), message.get('token')),
        body = {
          "recipient": {"id": message.get("sender").get("senderId")},
          "message": {"text": response_intent.get("respond")}
        },
      )
      fb_response = response.json()
      
      now = datetime.datetime.now()
      iso_time = now.isoformat()
      
      message_info = {
        "message": response_intent.get("respond"),
        "sender": {
          "id": message.get("recipient").get("senderId"),
          "name": message.get("recipient").get("fullName"),
          "avatar": message.get("recipient").get("avatarUrl"),
        },
        "recipient": {
          "id": message.get("sender").get("senderId"),
          "name": message.get("sender").get("fullName"),
          "avatar": message.get("sender").get("avatarUrl"),
        },
        "messageId": fb_response.get("message_id"),
        "networkId": message.get('pageId'),
        "createdAt": iso_time,
      }
      
      backend_auth_header = {
        'Authorization': settings.BACKEND_AUTH_HEADER
      }
      response_save_comment = await PostMethod(
        domain = settings.BACKEND_ENPOINT, 
        endpoint = "/message/save", 
        body = message_info, 
        headers = backend_auth_header
      )
      print("Response save message: ", response_save_comment)
  elif notify_agent == True:
    backend_auth_header = {
      'Authorization': settings.BACKEND_AUTH_HEADER
    }
    notify_agent_response = await PostMethod(
      domain = settings.BACKEND_ENPOINT,
      endpoint = "workflow/{0}/notifyAgent".format(message.get("flowId")),
      headers = backend_auth_header,
      body = {
        "messageId": message.get("messageId"),
        "messageType": message.get("messageType"),
        "notifyAgentMessage": "Intent"
      }
    )
    print(notify_agent_response)
    

def find_data(list, find_data, notify_agent = True):
  if not find_data and notify_agent:
    return None
  elif not find_data :
    for data in list:
      if data.get("hasFallback") == True:
        return data
    
  for data in list:
    print(data.get("intentId"), find_data)
    if find_data == data.get("intentId"):
        return data


  return None