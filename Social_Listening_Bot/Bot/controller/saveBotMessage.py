from fastapi import APIRouter, BackgroundTasks, Request

from service.saveBotMessage import handle_save_message_bot_thread

router = APIRouter()

@router.post("")
async def handling_save_bot_message(background_tasks: BackgroundTasks, request: Request):
    message = await request.json()
    background_tasks.add_task(handle_save_message_bot_thread, message)
    return {"message": "Send webhook successfully"}