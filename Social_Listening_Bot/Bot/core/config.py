import os
from dotenv import load_dotenv, dotenv_values
from pydantic import BaseSettings

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
load_dotenv()
config_env = dotenv_values(os.path.join(BASE_DIR, '.env'))

class Settings(BaseSettings):
    PROJECT_NAME = os.getenv('PROJECT_NAME', 'FASTAPI BASE')
    SECRET_KEY = os.getenv('SECRET_KEY', '')
    API_PREFIX = ''
    BACKEND_CORS_ORIGINS = ['*']
    RASA_BOT_ENDPOINT = config_env["RASA_BOT_URL"]
    ACTION_ENDPOINT = config_env["RASA_ACTION_URL"]
    BACKEND_ENPOINT = config_env["SOCIAL_PAGE_URL"]
    BACKEND_AUTH_HEADER = config_env["AUTHORIZATION_API_KEY"]
    FACEBOOK_GRAPH_ENDPOINT = config_env["FACEBOOK_GRAPH_ENDPOINT"]
    DIALOGFLOW_ENDPOINT = config_env["DIALOGFLOW_ENDPOINT"]

settings = Settings()
