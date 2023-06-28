import asyncio
import concurrent.futures
import json

from core.config import settings
from helper.httpMethod import GetMethod

from helper.execAsyncFunction import async_function_executor
from service.intergration.saveSocialMessage import save_social_message

async def handle_message_thread(message: any):
	with concurrent.futures.ThreadPoolExecutor() as executor:
		future = executor.submit(async_function_executor, handle_message, message=message)
		return await asyncio.wrap_future(future)

async def handle_message(message: any):
  backend_auth_header = {
    'Authorization': settings.BACKEND_AUTH_HEADER
  }
  network = await GetMethod(
    domain=settings.BACKEND_ENPOINT, 
    endpoint="/socialNetwork/{0}".format(message.get('recipient_id')),
    header= backend_auth_header
  )
  network_info = network.json()
  network_extend_data = json.loads(network_info.get('extendData'))
  
  sender_response = await GetMethod(
    domain= settings.FACEBOOK_GRAPH_ENDPOINT, 
    endpoint="/{0}?fields=picture,name&access_token={1}".format(message.get('sender_id'), network_extend_data.get('accessToken'))
  )
  sender_info = sender_response.json()
  message["sender"] = {
		"name": sender_info.get('name'),
		"avatar": sender_info.get('picture').get('data').get('url'),
		"id": sender_info.get('id'),
	}
  
  if message.get("type_message") == "Message":
    recipient_response = await GetMethod(
			domain= settings.FACEBOOK_GRAPH_ENDPOINT, 
			endpoint="/{0}?fields=picture,name&access_token={1}".format(message.get('recipient_id'), network_extend_data.get('accessToken'))
		)
    recipient_info = recipient_response.json()
    message["recipient"] = {
			"name": recipient_info.get('name'),
			"avatar": recipient_info.get('picture').get('data').get('url'),
			"id": recipient_info.get('id'),
		}

  await save_social_message(message, None) 