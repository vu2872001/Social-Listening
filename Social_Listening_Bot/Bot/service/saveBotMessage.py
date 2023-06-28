import asyncio
import concurrent.futures
from nltk.sentiment import SentimentIntensityAnalyzer

from service.intergration.saveSocialMessage import save_social_message
from helper.execAsyncFunction import async_function_executor

async def handle_save_message_bot_thread(message: any):
  with concurrent.futures.ThreadPoolExecutor() as executor:
    future = executor.submit(async_function_executor, handle_save_message_bot, message=message)
    return await asyncio.wrap_future(future)
  
async def handle_save_message_bot(message: any):
    sia = SentimentIntensityAnalyzer()
    score = sia.polarity_scores(message.get("text"))
    sentiment = score.get("compound")
    print("Sentiment of bot: ", sentiment)
    # print("Message of bot: ", message)
    await save_social_message(message, sentiment)
    return "Save social message successfully"
