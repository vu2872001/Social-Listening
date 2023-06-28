from fastapi import APIRouter, BackgroundTasks, Request

from service.intergration.calculateSentiment import calculate_sentiment_thread

router = APIRouter()

@router.post("")
async def handling_sentiment(background_tasks: BackgroundTasks, request: Request):
  message = await request.json()
  background_tasks.add_task(calculate_sentiment_thread, message)
  # value = await calculate_sentiment(message)
  return { "success": True }