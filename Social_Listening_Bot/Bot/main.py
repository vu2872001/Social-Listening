import sys
sys.dont_write_bytecode = True

import uvicorn
from fastapi import FastAPI

import nltk
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
nltk.download('vader_lexicon')

from fastapi.middleware.cors import CORSMiddleware

from router.router import router
from core.config import settings
from bots import server_dialogflow

def get_application() -> FastAPI:
  application = FastAPI()
  application.add_middleware(
      CORSMiddleware,
      allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  application.include_router(router, prefix=settings.API_PREFIX)
  application.include_router(server_dialogflow.router)
  
  return application

app = get_application()
if __name__ == '__main__':
    uvicorn.run("main:app", port=8000, reload = True)
