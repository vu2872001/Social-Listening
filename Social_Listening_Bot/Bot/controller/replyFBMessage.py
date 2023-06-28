from fastapi import APIRouter, BackgroundTasks, Request

from service.intergration.replyFBMessage import reply_facebook_message_thread

router = APIRouter()

@router.post("")
async def handling_sentiment(background_tasks: BackgroundTasks, request: Request):
  message = await request.json()
  background_tasks.add_task(reply_facebook_message_thread, message)
  return { "success": True }