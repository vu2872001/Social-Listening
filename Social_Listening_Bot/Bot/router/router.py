from fastapi import APIRouter

from controller import saveMessage, calculateSentiment, replyFBMessage

router = APIRouter()

router.include_router(saveMessage.router, prefix = "/webhook/rasa")
router.include_router(calculateSentiment.router, prefix = "/sentiment")
router.include_router(replyFBMessage.router, prefix = "/reply-message")
