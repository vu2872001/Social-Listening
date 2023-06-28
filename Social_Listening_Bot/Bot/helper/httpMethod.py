import httpx
from urllib.parse import urljoin

async def PostMethod(domain, endpoint, body, headers={}):
  url = urljoin(domain, endpoint) 
  timeout = httpx.Timeout(100)
  async with httpx.AsyncClient() as client:
    response = await client.post(url=url, headers=headers, json=body, timeout=timeout)
  return response

async def GetMethod(domain, endpoint, header = {}): 
  url = urljoin(domain, endpoint)
  timeout = httpx.Timeout(100)
  async with httpx.AsyncClient() as client:
    response = await client.get(url=url, headers=header, timeout=timeout)
  return response