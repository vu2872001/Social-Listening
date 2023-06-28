from fastapi import APIRouter, BackgroundTasks, Request

from service.saveMessage import handle_message_thread

router = APIRouter()

@router.post("")
async def handling_save_message(background_tasks: BackgroundTasks, request: Request):
    message = await request.json()
    background_tasks.add_task(handle_message_thread, message)
    return {"message": "Send webhook successfully"}