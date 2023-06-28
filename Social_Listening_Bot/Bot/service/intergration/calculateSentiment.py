import asyncio
import nltk
import concurrent.futures
from nltk.tokenize import word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer

from helper.httpMethod import PostMethod
from core.config import settings
from helper.execAsyncFunction import async_function_executor

async def calculate_sentiment_thread(message: any):
	with concurrent.futures.ThreadPoolExecutor() as executor:
		future = executor.submit(async_function_executor, calculate_sentiment, message=message)
		return await asyncio.wrap_future(future)

async def calculate_sentiment(message: any):
  tabId = message.get('tabId')
  messageId = message.get('messageId')
  sentence = message.get('message')
  message_type = message.get('messageType')
  
  sia = SentimentIntensityAnalyzer()
  sentiment = sia.polarity_scores(sentence)
  
  tokens = word_tokenize(sentence)
  tagged_tokens = nltk.pos_tag(tokens)
  
  listSentence = []
  new_sentence = []
  
  for word, tag in tagged_tokens:
    if tag in ('CC', ',', '.', '!', ';'):
      if len(new_sentence) != 0:
        listSentence.append(''.join(new_sentence))
        new_sentence = []
    else:
      new_sentence.append(" " + word  if tag not in ('``', "''") else word)
  if (len(new_sentence)):
    listSentence.append(' '.join(new_sentence))
  
  sentiment_sentence = []
  for word in listSentence:
    spec_sentiment = sia.polarity_scores(word)
    sentiment_sentence.append((spec_sentiment["compound"] + 1)/2)

  dataReturn = {
    "tabId": tabId,
    "messageId": messageId,
    "sentiment": sentiment_sentence,
    "exactSentiment": (sentiment["compound"] + 1)/2
  }

  backend_auth_header = {
    'Authorization': settings.BACKEND_AUTH_HEADER
  }
  response_calculate_sentiment = await PostMethod(
    domain = settings.BACKEND_ENPOINT, 
    endpoint = "/social-message/calculate-sentiment" if (message_type == 'Comment') else "/message/calculate-sentiment",
    body = dataReturn, 
    headers = backend_auth_header
  )
  print("Calculate sentiment: ", response_calculate_sentiment)