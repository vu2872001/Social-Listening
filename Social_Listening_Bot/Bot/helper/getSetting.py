
from core.config import settings
from helper.httpMethod import PostMethod


async def get_setting(key, group):
  response = await PostMethod(
    domain = settings.BACKEND_ENPOINT,
    endpoint = "/setting/getSettingByKeyAndGroup",
    body = {
      "key": key,
      "group": group,
    }
  )
  
  response_json = response.json()
  return response_json.get('value')