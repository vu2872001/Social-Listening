import asyncio

def async_function_executor(func, *args, **kwargs):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    future = loop.create_future()
    async def wrapper():
        result = await func(*args, **kwargs)
        future.set_result(result) 
    loop.run_until_complete(wrapper())
    loop.close()
    return future.result()
