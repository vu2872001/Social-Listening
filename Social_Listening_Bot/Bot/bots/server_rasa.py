from typing import Optional, List
from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Request, BackgroundTasks
from rasa.model_training import train
from rasa.core.agent import Agent
from rasa.utils.endpoints import EndpointConfig
from rasa.shared.constants import DEFAULT_NLU_FALLBACK_INTENT_NAME
from rasa.core.http_interpreter import RasaNLUHttpInterpreter
from textblob import TextBlob
from urllib.parse import urljoin
from dotenv import dotenv_values

import httpx
import yaml
import shutil
import os
import concurrent.futures
import asyncio
import glob

import nltk
nltk.download('vader_lexicon')
from nltk.sentiment import SentimentIntensityAnalyzer

router = APIRouter()

text_import_library = f"""
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher
from textblob import TextBlob
"""
config_env = dotenv_values(".env")
social_page_url = config_env["SOCIAL_PAGE_URL"]
action_endpoint = EndpointConfig(url=config_env["RASA_ACTION_URL"])
http_interpreter = RasaNLUHttpInterpreter(EndpointConfig(
    url=config_env["RASA_BOT_URL"],
    params={},
    headers={
        "Content-Type": "application/json",
    },
    basic_auth=None,
))

agent_list = {}
utter_action_list = []

class FileTrain:
    def __init__(self, fixed_model_name="default_model", domain=None, config=None, training_files=[]):
        self.fixed_model_name = fixed_model_name
        self.domain = domain
        self.config = config
        self.training_files = training_files

def create_sample_action(class_name, action_name, utter_key): 
    return f"""
class {class_name}(Action):
    def name(self) -> Text:
        return "{action_name}"
    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        print("-------------------------------- Utter Action --------------------------------")
        entities = tracker.latest_message.get("entities")
        print("entities: ", entities)    

        confidence_of_entities = {{}}        
        for entity in entities:
            entity_name = entity.get('entity')  
            entity_value = entity.get('value')         
            confidence_entity = entity.get('confidence_entity')
            print('confidence_entity: ', confidence_entity)
            if tracker.slots.get(entity_name) is None:
                tracker.slots[entity_name] = entity_value
                confidence_of_entities[entity_name] = confidence_entity
            else:
                if confidence_of_entities.get(entity_name) is not None and confidence_entity > confidence_of_entities.get(entity_name):
                    tracker.slots[entity_name] = entity_value
                    confidence_of_entities[entity_name] = confidence_entity
            print("Slot of entity: ", tracker.slots[entity_name])

        dispatcher.utter_message(response="{utter_key}", **dict(tracker.slots.items()))        
        return []
"""

def create_file_train(pathFile: str):
    data_file = None
    folder_actions_location = os.path.join("actions")
    file_actions_location = os.path.join(folder_actions_location, "actions.py")
    if not os.path.exists(folder_actions_location):
        os.makedirs(folder_actions_location)
    if not os.path.exists(file_actions_location):
        with open(file_actions_location, 'w') as buffer: 
            buffer.write(text_import_library)

    if os.path.exists(pathFile):
        with open(pathFile, "r", encoding='utf-8') as file:
            if file.name.endswith('domain.yml') or file.name.endswith("domain.yaml"):
                data_file = yaml.safe_load(file)
                if data_file is not None:
                    with open(file_actions_location, 'a') as buffer:
                        for key in data_file["responses"].keys():
                            key_name = key.replace('_', ' ').title().replace(' ', '')
                            class_name = "Action" + key_name
                            action_name = "action_" + key 
                            data_file["actions"].append(action_name)
                            if action_name not in utter_action_list:
                                utter_action_list.append(action_name)
                                buffer.write(create_sample_action(class_name, action_name, key))

            if file.name.endswith("stories.yml") or file.name.endswith("stories.yaml"):
                data_file = yaml.safe_load(file)
                if data_file is not None:
                    for story in data_file['stories']:
                        for step in story['steps']:
                            for key, value in step.items():
                                if (key == 'action' and "utter_" in value[0:6]):
                                    step[key] = 'action_' + value

            if file.name.endswith('rules.yml') or file.name.endswith("rules.yaml"):
                data_file = yaml.safe_load(file)
                if data_file is not None:
                    for rule in data_file['rules']:
                        for step in rule['steps']:
                            for key, value in step.items():
                                if (key == 'action' and "utter_" in value[0:6]):
                                    step[key] = 'action_' + value

    if data_file is not None: 
        with open(pathFile, 'w') as file:
            yaml.dump(data_file, file)

def create_file_custom_action():
    folder_actions_location = os.path.join("actions")
    if not os.path.exists(folder_actions_location):
        os.makedirs(folder_actions_location)
    file_actions_location = os.path.join(folder_actions_location, "actions.py")
    with open(file_actions_location, 'w') as buffer: 
        buffer.write(text_import_library)  

    uploads_path = "./uploads"
    if not os.path.exists(uploads_path):
        os.makedirs(uploads_path)
    folders_path = [f.path for f in os.scandir(uploads_path) if f.is_dir()]
    for folder_path in folders_path:
        file_domain_location = os.path.join(folder_path, "domain.yml")
        if os.path.exists(file_domain_location):
            with open(file_domain_location, "r", encoding='utf-8') as file:
                data_file = yaml.safe_load(file)
                if data_file is not None:
                    with open(file_actions_location, 'a') as buffer: 
                        if "responses" in data_file:
                            for key in data_file.get("responses").keys():
                                key_name = key.replace('_', ' ').title().replace(' ', '')
                                class_name = "Action" + key_name
                                action_name = "action_" + key 
                                data_file["actions"].append(action_name)
                                if action_name not in utter_action_list:
                                    utter_action_list.append(action_name)
                                    buffer.write(create_sample_action(class_name, action_name, key))        

def load_all_model():
    # Define the path to the models directory
    models_dir = 'models/'
    # Get a list of all the .tar.gz files in the models directory
    model_files = glob.glob(models_dir + '*.tar.gz')
    # Iterate through the list of model files
    for model_file in model_files:
        filename = os.path.basename(model_file)
        model_path = os.path.join("models", filename)
        if os.path.exists(model_path):
            model_id = os.path.splitext(os.path.splitext(os.path.basename(filename))[0])[0]
            agent_list[model_id] = Agent.load(model_path, action_endpoint=action_endpoint)
# import multiprocessing
#  with multiprocessing.Pool(processes=4) as pool:
#         future = pool.apply_async(async_function_executor, handle_train_model, bot_id=bot_id, service_url=service_url, files=files)
#         result = future.get()
#         return result

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

async def httpx_post(domain, endpoint, body, headers={}):
    url = urljoin(domain, endpoint) 
    async with httpx.AsyncClient() as client:
        response = await client.post(url=url, headers=headers, json=body)
    return response

async def save_social_message(message, sentiment):
    if message.get("type_message") == "Comment":
        comment_info = {
            "networkId": message.get("recipient_id"),
            "message": message.get("text"),
            "sender": message.get("sender_id"),
            "createdAt": message.get("metadata").get("comment_created_time"),
            "type": message.get("type_message"),
            "parent": {
                "postId": message.get("metadata").get("post_id"),
                "message": message.get("metadata").get("post_message"),
                "permalinkUrl": message.get("metadata").get("permalink_url"),
                "createdAt": message.get("metadata").get("post_created_time")
            },
            "sentiment": sentiment,
            "postId": message.get("metadata").get("post_id"),
            "commentId": message.get("metadata").get("comment_id"),
            "parentId": message.get("metadata").get("parent_id")
        }
        social_page_headers = {'Authorization': config_env["AUTHORIZATION_API_KEY"]}
        response_save_comment = await httpx_post(domain=social_page_url, endpoint="/social-message/save", body=comment_info, headers=social_page_headers)
        print("Response save comment: ", response_save_comment)

async def handle_train_model(bot_id: str, service_url: str, files: List[Optional[UploadFile]]):
    folder_location = os.path.join("uploads", bot_id)
    if not os.path.exists(folder_location):
        os.makedirs(folder_location)
    file_train = FileTrain(bot_id, '', '', [])    
    for file in files:
        if file.filename.endswith('.yml') or file.filename.endswith(".yaml"):
            try:            
                file_location = os.path.join(folder_location, file.filename)
                with open(file_location, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                    fileName=os.path.splitext(os.path.basename(file.filename))[0]
                    if hasattr(file_train, fileName):
                        setattr(file_train, fileName, file_location)
                    else:
                        file_train.training_files.append(file_location)
                create_file_train(file_location)
            except yaml.YAMLError as exc:
                raise HTTPException(status_code=400, detail="Invalid YAML file") from exc
    result_train = train(domain=file_train.domain, config=file_train.config, training_files=file_train.training_files, output="models/", fixed_model_name=file_train.fixed_model_name)
    model_path = os.path.join("models", bot_id + ".tar.gz")
    agent_list[bot_id] = Agent.load(model_path, action_endpoint=action_endpoint)
    response = await httpx_post(domain=service_url, endpoint="/rasa/training-result", body=result_train)
    # print("Status code", response.status_code)
    return response

async def handle_message(message: any):
    result = {
        "sender_id": message.get("recipient_id"),
        "recipient_id": message.get("sender_id"),
        "text": "",
        "channel": message.get("channel"),
        "type_message": message.get("type_message"), 
        "metadata": message.get("metadata")
    }
    
    sia = SentimentIntensityAnalyzer()
    score = sia.polarity_scores(message.get("text"))
    sentiment = score.get("compound")
    print("Sentiment of user: ", sentiment)  
    await save_social_message(message, sentiment)

    if message.get("recipient_id") in agent_list:
        response = await agent_list.get(message.get("recipient_id")).handle_text(text_message=message.get("text"), sender_id=message.get("sender_id"))          
        if response:
            if len(response) == 0:
                result["text"] = "Sorry, I don't understand"
            else: result["text"] = response[0]["text"]
        else:
            fallback_response = await agent_list.get(message.get("recipient_id")).handle_text(DEFAULT_NLU_FALLBACK_INTENT_NAME, sender_id=message.get("sender_id"))
            print("fallback_response: ", fallback_response)
            if len(fallback_response) == 0:
                result["text"] = "Sorry, I don't understand"
            else: result["text"] = fallback_response[0]["text"]
    else:
        result["text"] = f"""Model {message.get('recipient_id')} not exist"""

    response = await httpx_post(domain=message.get("service_url"), endpoint="/rasa/conversations/activities", body=result)
    return response

async def handle_save_message_bot(message: any):
    sia = SentimentIntensityAnalyzer()
    score = sia.polarity_scores(message.get("text"))
    sentiment = score.get("compound")
    print("Sentiment of bot: ", sentiment)
    # print("Message of bot: ", message)
    await save_social_message(message, sentiment)
    return "Save social message successfully"

async def handle_train_model_thread(bot_id: str, service_url: str, files: List[Optional[UploadFile]]):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(async_function_executor, handle_train_model, bot_id=bot_id, service_url=service_url, files=files)
        return await asyncio.wrap_future(future)

async def handle_message_thread(message: any):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(async_function_executor, handle_message, message=message)
        return await asyncio.wrap_future(future)
    
async def handle_save_message_bot_thread(message: any):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(async_function_executor, handle_save_message_bot, message=message)
        return await asyncio.wrap_future(future)

@router.post('/train')
async def handling_model(background_tasks: BackgroundTasks, bot_id: str = Form(), service_url: str = Form(), files: List[Optional[UploadFile]] = File(...)):
    background_tasks.add_task(handle_train_model_thread, bot_id, service_url, files)
    return {"message": "Send webhook successfully"}

@router.post('/webhook/rasa')
async def handling_message(background_tasks: BackgroundTasks, request: Request):
    message = await request.json()
    background_tasks.add_task(handle_message_thread, message)
    return {"message": "Send webhook successfully"}

@router.post('/save-message-bot')
async def handling_sentiment(background_tasks: BackgroundTasks, request: Request):
    message = await request.json()
    background_tasks.add_task(handle_save_message_bot_thread, message)
    return {"message": "Send webhook successfully"}

create_file_custom_action()
print("utter_action_list", utter_action_list)

load_all_model()
print(agent_list)

print("Start server rasa successfully")