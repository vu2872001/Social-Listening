from fastapi import APIRouter, UploadFile, File
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.cloud.dialogflowcx_v3 import Intent, Agent, EntityType
from google.cloud.dialogflowcx_v3 import AgentsAsyncClient, IntentsAsyncClient, EntityTypesAsyncClient, FlowsAsyncClient, SessionsAsyncClient, PagesAsyncClient, TransitionRouteGroupsAsyncClient
from google.cloud.dialogflowcx_v3 import TextInput, QueryInput, QueryParameters, TransitionRoute, UpdateFlowRequest, Fulfillment
from google.api_core.client_options import ClientOptions

from google.protobuf.field_mask_pb2 import FieldMask

import httpx
import fastapi
import json
import os

router = APIRouter()

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credential.json"

def get_client_options(location):
    api_endpoint = "dialogflow.googleapis.com"
    if location is not None and not location.lower().startswith("global"):
        api_endpoint = f"{location}-dialogflow.googleapis.com"
    return ClientOptions(api_endpoint=api_endpoint)

def get_code_ex(ex):
    if "400" in str(ex):
        return 400
    elif "401" in str(ex):
        return 401
    elif "403" in str(ex):
        return 403
    elif "404" in str(ex):
        return 404
    elif "409" in str(ex):
        return 409
    else:
        return 500
    
async def update_flow_agent(project_id: str, location: str, agent_id: str, intent_name: str):
    client_options = get_client_options(location)
    flows_client = FlowsAsyncClient(client_options=client_options)
    flow_name = flows_client.flow_path(project_id, location, agent_id, "00000000-0000-0000-0000-000000000000")
    
    flow = await flows_client.get_flow(name=flow_name)
    start_flow_transition = TransitionRoute(intent=intent_name, trigger_fulfillment=Fulfillment(messages=[]), name="")
    flow.transition_routes.append(start_flow_transition)

    update_request = UpdateFlowRequest(flow=flow, update_mask=FieldMask(paths=["transition_routes"]))
    try:
        updated_flow = await flows_client.update_flow(update_request)
        print("Flow updated successfully: {}".format(updated_flow.name))
    except Exception as ex:
        print("Error updating flow: {}".format(ex)) 

@router.post("/get-token")
async def get_token(contents: str, file: UploadFile = File(...)):
    SCOPES = ['https://www.googleapis.com/auth/cloud-platform']
    if contents is None:
        contents = await file.read()
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(contents), scopes=SCOPES)
    credentials.refresh(Request())
    return {"access_token": credentials.token}

# Intent
@router.post("/create-intent/projects/{project_id}/locations/{location}/agents/{agent_id}")
async def create_intent(project_id: str, location: str, agent_id: str, request: fastapi.Request, response: fastapi.Response):
    intent_info = await request.json()
    client_options = get_client_options(location)

    intents_client = IntentsAsyncClient(client_options=client_options)
    agents_client = AgentsAsyncClient()
    intents_parent = agents_client.agent_path(project_id, location, agent_id)

    intent = Intent()
    intent.display_name = intent_info.get("display_name")
    intent.description = intent_info.get("description")
    intent.priority = intent_info.get("priority")
    intent.is_fallback = intent_info.get("is_fallback") 
    intent.training_phrases = intent_info.get("training_phrases") 
    intent.parameters = intent_info.get("parameters") 

    # for phrase in intent_info.get("training_phrases", []):
    #     training_phrase = Intent.TrainingPhrase()
    #     for part in phrase.get("parts", []):
    #         training_phrase.parts.append(Intent.TrainingPhrase.Part(text=part.get("text"), parameter_id=part.get("parameter_id")))
    #     training_phrase.repeat_count = phrase.get("repeat_count")
    #     intent.training_phrases.append(phrase)

    try:
        new_intent = await intents_client.create_intent(parent=intents_parent, intent=intent)
        print("Intent created successfully: {}".format(new_intent.name))
        await update_flow_agent(project_id, location, agent_id, new_intent.name)

        training_phrases = []
        for phrase in new_intent.training_phrases:
            training_phrase = {"parts": [], "repeat_count": 1}
            for part in phrase.parts:
                training_phrase["parts"].append({"text": part.text, "parameter_id": part.parameter_id})
            training_phrase["repeat_count"] = phrase.repeat_count
            training_phrases.append(training_phrase)
        parameters = []
        for parameter in new_intent.parameters:
            parameters.append({
                "id": parameter.id,
                "entity_type": parameter.entity_type,
                "is_list": parameter.is_list,
            })
        return {
            "name": new_intent.name,
            "display_name": new_intent.display_name,
            "training_phrases": training_phrases,
            "priority": new_intent.priority,            
            "description": intent.description,
            "parameters": parameters
        }
    except Exception as ex:
        response.status_code = get_code_ex(ex)
        print("Error creating intent: {}".format(ex)) 
        return {"message": "Error creating intent: {}".format(ex)}

@router.get("/get-intent/projects/{project_id}/locations/{location}/agents/{agent_id}/intents/{intent_id}")
async def get_intent(project_id: str, location: str, agent_id: str, intent_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    intents_client = IntentsAsyncClient(client_options=client_options)
    intent_name = intents_client.intent_path(project_id, location, agent_id, intent_id)
    try:
        intent = await intents_client.get_intent(request={"name":intent_name})
        training_phrases = []
        for phrase in intent.training_phrases:
            training_phrase = {"parts": [], "repeat_count": 1}
            for part in phrase.parts:
                training_phrase["parts"].append({"text": part.text, "parameter_id": part.parameter_id})
            training_phrase["repeat_count"] = phrase.repeat_count
            training_phrases.append(training_phrase)

        parameters = []
        for parameter in intent.parameters:
            parameters.append({
                "id": parameter.id,
                "entity_type": parameter.entity_type,
                "is_list": parameter.is_list,
            })
        return {
            "name": intent.name,
            "display_name": intent.display_name,
            "training_phrases": training_phrases,
            "is_fallback": intent.is_fallback,
            "priority": intent.priority,
            "description": intent.description,
            "parameters": intent.parameters
        }
    except Exception as ex:
        response.status_code = get_code_ex(ex)
        print("Error getting intent: {}".format(ex)) 
        return {"message": "Error getting intent: {}".format(ex)}

@router.get("/get-list-intent/projects/{project_id}/locations/{location}/agents/{agent_id}")
async def get_list_intent(project_id: str, location: str, agent_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    intents_client = IntentsAsyncClient(client_options=client_options)
    agents_client = AgentsAsyncClient()
    intents_parent = agents_client.agent_path(project_id, location, agent_id)
    try:
        pager = await intents_client.list_intents(request={"parent": intents_parent})
        intents = []
        async for page in pager.pages:
            for intent in page.intents:
                training_phrases = []
                for phrase in intent.training_phrases:
                    training_phrase = {"parts": [], "repeat_count": 1}
                    for part in phrase.parts:
                        training_phrase["parts"].append({"text": part.text, "parameter_id": part.parameter_id})
                    training_phrase["repeat_count"] = phrase.repeat_count
                    training_phrases.append(training_phrase)
                parameters = []
                for parameter in intent.parameters:
                    parameters.append({
                        "id": parameter.id,
                        "entity_type": parameter.entity_type,
                        "is_list": parameter.is_list,
                    })
                agent_json = {
                    "name": intent.name,
                    "display_name": intent.display_name,
                    "training_phrases": training_phrases,
                    "priority": intent.priority,
                    "is_fallback": intent.is_fallback,
                    "description": intent.description,
                    "parameters": parameters
                }
                intents.append(agent_json)
        return intents
    except Exception as ex:
        response.status_code = get_code_ex(ex)
        print("Error getting intent: {}".format(ex)) 
        return {"message": "Error getting intent: {}".format(ex)}

@router.patch("/update-intent/projects/{project_id}/locations/{location}/agents/{agent_id}/intents/{intent_id}")
async def update_intent(project_id: str, location: str, agent_id: str, intent_id: str, request: fastapi.Request, response: fastapi.Response):
    intent_info = await request.json()
    client_options = get_client_options(location)
    intents_client = IntentsAsyncClient(client_options=client_options)
    intent_name = intents_client.intent_path(project_id, location, agent_id, intent_id)
    try:
        intent = await intents_client.get_intent(name=intent_name)
        intent.display_name = intent_info.get("display_name")
        intent.description = intent_info.get("description")
        intent.priority = intent_info.get("priority")
        intent.is_fallback = intent_info.get("is_fallback") 
        intent.training_phrases = intent_info.get("training_phrases", [])
        # for phrase in intent_info.get("training_phrases", []):
        #     training_phrase = Intent.TrainingPhrase()
        #     for part in phrase.get("parts", []):
        #         training_phrase.parts.append(Intent.TrainingPhrase.Part(text=part.get("text"), parameter_id=part.get("parameter_id")))
        #     training_phrase.repeat_count = phrase.get("repeat_count")
        #     intent.training_phrases.append(phrase)
        updated_intent = await intents_client.update_intent(request={"intent": intent})
        print("Intent updated successfully: {}".format(updated_intent.name))
        training_phrases = []
        for phrase in updated_intent.training_phrases:
            training_phrase = {"parts": [], "repeat_count": 1}
            for part in phrase.parts:
                training_phrase["parts"].append({"text": part.text, "parameter_id": part.parameter_id})
            training_phrase["repeat_count"] = phrase.repeat_count
            training_phrases.append(training_phrase)
        parameters = []
        for parameter in intent.parameters:
            parameters.append({
                "id": parameter.id,
                "entity_type": parameter.entity_type,
                "is_list": parameter.is_list,
            })
        return {
            "name": updated_intent.name,
            "display_name": updated_intent.display_name,
            "training_phrases": training_phrases,
            "priority": intent.priority,
            "is_fallback": intent.is_fallback,
            "description": intent.description,
            "parameters": parameters
        }
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error updating intent: {}'.format(ex)) 
        return {"message": "Error updating intent: {}".format(ex)}

@router.delete("/delete-intent/projects/{project_id}/locations/{location}/agents/{agent_id}/intents/{intent_id}")
async def delete_intent(project_id: str, location: str, agent_id: str, intent_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    intents_client = IntentsAsyncClient(client_options=client_options)
    flows_client = FlowsAsyncClient(client_options=client_options)
    
    intent_name = intents_client.intent_path(project_id, location, agent_id, intent_id)
    flows_parent = f"projects/{project_id}/locations/{location}/agents/{agent_id}"
    try:
        flows_pager = await flows_client.list_flows(request={"parent": flows_parent})
        async for flows_page in flows_pager.pages:
            for flow in flows_page.flows:
                modified_routes = []
                for route in flow.transition_routes:
                    if route.intent != intent_name:
                        modified_routes.append(route)
                    if len(modified_routes) != len(flow.transition_routes):
                        flow.transition_routes = modified_routes
                        await flows_client.update_flow(request={"flow": flow})

        await intents_client.delete_intent(request={"name": intent_name})    
        return {"result": "Intent deleted successfully: {}".format(intent_name)}
    except Exception as ex:
        response.status_code = get_code_ex(ex)
        print("Error deleting intent: {}".format(ex)) 
        return {"message": "Error deleting intent: {}".format(ex)}

@router.post("/detect-intent/projects/{project_id}/locations/{location}/agents/{agent_id}/sessions/{session_id}")
async def detect_intent(project_id: str, location: str, agent_id: str, session_id: str, request: fastapi.Request, response: fastapi.Response):   
    message_info = await request.json()
    client_options = get_client_options(location)

    sessions_client = SessionsAsyncClient(client_options=client_options)
    session_name = sessions_client.session_path(project_id, location, agent_id, session_id)
    language_code = message_info.get("language_code") or "en"
    query_input = QueryInput(text=TextInput(text=message_info.get("text")), language_code=language_code)
    query_params = QueryParameters(time_zone='Asia/Bangkok', analyze_query_text_sentiment=True)

    try:
        deteced_intent = await sessions_client.detect_intent(request={"session": session_name, "query_input": query_input, "query_params": query_params})
        # print('Intent detected')
        query_result = deteced_intent.query_result
        result = {
            "text": query_result.text,
            "language_code": query_result.language_code,
            "intent": query_result.intent.name,
            "intent_detection_confidence": query_result.intent_detection_confidence,
            "sentiment_score": query_result.sentiment_analysis_result.score,
            "sentiment_magnitude": query_result.sentiment_analysis_result.magnitude,
        }
        return result
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error detecting intent: {}'.format(ex)) 
        return {"message": "Error detecting intent: {}".format(ex)}


# Agent
@router.post("/create-agent/projects/{project_id}/locations/{location}")
async def create_agent(project_id: str, location: str, request: fastapi.Request, response: fastapi.Response):
    agent_info = await request.json()
    client_options = get_client_options(location)
    agents_client = AgentsAsyncClient(client_options=client_options)
    agent = Agent()
    agent.display_name = agent_info.get("display_name")
    agent.default_language_code = agent_info.get("default_language_code")
    agent.time_zone = agent_info.get("time_zone")
    try:
        new_agent = await agents_client.create_agent(request={"parent": f"projects/{project_id}/locations/{location}", "agent": agent})
        return {
            "name": new_agent.name,
            "display_name": new_agent.display_name,
            "default_language_code": new_agent.default_language_code,
            "time_zone": new_agent.time_zone,
            "start_flow": new_agent.start_flow,
        }
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error creating agent: {}'.format(ex)) 
        return {"message": "Error creating agent: {}".format(ex)}

@router.get("/get-agent/projects/{project_id}/locations/{location}/agents/{agent_id}")
async def get_agent(project_id: str, location: str, agent_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    agents_client = AgentsAsyncClient(client_options=client_options)
    agent_name = agents_client.agent_path(project_id, location, agent_id)
    try:
        agent = await agents_client.get_agent(request={"name":agent_name})
        return {
            "name": agent.name,
            "display_name": agent.display_name,
            "default_language_code": agent.default_language_code,
            "time_zone": agent.time_zone,
            "start_flow": agent.start_flow,
        }
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error getting agent: {}'.format(ex)) 
        return {"message": "Error getting agent: {}".format(ex)}

@router.get("/get-list-agent/projects/{project_id}/locations/{location}")
async def get_list_agent(project_id: str, location: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    agents_client = AgentsAsyncClient(client_options=client_options)
    try:
        pager = await agents_client.list_agents(request={"parent": f"projects/{project_id}/locations/{location}"})
        agents = []
        async for page in pager.pages:
            for agent in page.agents:
                agent_json = {
                    "name": agent.name,
                    "display_name": agent.display_name,
                    "default_language_code": agent.default_language_code,
                    "time_zone": agent.time_zone,
                    "start_flow": agent.start_flow,
                }
                agents.append(agent_json)
        return agents
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error getting list agent: {}'.format(ex)) 
        return {"message": "Error getting list agent: {}".format(ex)}
    
@router.patch("/update-agent/projects/{project_id}/locations/{location}/agents/{agent_id}")
async def update_agent(project_id: str, location: str, agent_id: str, request: fastapi.Request, response: fastapi.Response):
    agent_info = await request.json()
    client_options = get_client_options(location)
    agents_client = AgentsAsyncClient(client_options=client_options)
    agent_name = agents_client.agent_path(project_id, location, agent_id)
    try:
        agent = await agents_client.get_agent(name=agent_name)
        agent.display_name = agent_info.get("display_name")
        agent.default_language_code = agent_info.get("default_language_code")
        agent.time_zone = agent_info.get("time_zone")
        updated_agent = await agents_client.update_agent(request={"agent": agent})
        return {
            "name": updated_agent.name,
            "display_name": updated_agent.display_name,
            "default_language_code": updated_agent.default_language_code,
            "time_zone": updated_agent.time_zone,
        }
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error creating agent: {}'.format(ex)) 
        return {"message": "Error creating agent: {}".format(ex)}
    
@router.delete("/delete-agent/projects/{project_id}/locations/{location}/agents/{agent_id}")
async def delete_agent(project_id: str, location: str, agent_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    agents_client = AgentsAsyncClient(client_options=client_options)
    agent_name = agents_client.agent_path(project_id, location, agent_id)
    try:
        await agents_client.delete_agent(request={"name": agent_name})    
        return {"result": "Agent deleted successfully: {}".format(agent_name)}
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error deleting agent: {}'.format(ex)) 
        return {"message": "Error deleting agent: {}".format(ex)}
    

# Entity type
@router.post("/create-entity-type/projects/{project_id}/locations/{location}/agents/{agent_id}")
async def create_entity_type(project_id: str, location: str, agent_id: str, request: fastapi.Request, response: fastapi.Response):
    entity_type_info = await request.json()
    
    client_options = get_client_options(location)
    entity_type_client = EntityTypesAsyncClient(client_options=client_options)

    agents_client = AgentsAsyncClient()
    entity_types_parent = agents_client.agent_path(project_id, location, agent_id)

    entity_type = EntityType()
    entity_type.display_name = entity_type_info.get("display_name")
    entity_type.kind = entity_type_info.get("kind", "KIND_LIST")
    entity_type.entities = entity_type_info.get("entities", [])
    entity_type.auto_expansion_mode = entity_type_info.get("auto_expansion_mode", "AUTO_EXPANSION_MODE_UNSPECIFIED")

    try:
        new_entity_type = await entity_type_client.create_entity_type(request={"parent": entity_types_parent, "entity_type": entity_type})
        entities = []
        for entity in new_entity_type.entities:
            synonyms = []
            for synonym in entity.synonyms:
                synonyms.append(synonym)
            entities.append({"value": entity.value, "synonyms": synonyms})
        return {
            "name": new_entity_type.name,
            "display_name": new_entity_type.display_name,
            "kind": new_entity_type.kind.name,
            "auto_expansion_mode": new_entity_type.auto_expansion_mode.name,
            "entities": entities,
        }
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error creating entity type: {}'.format(ex)) 
        return {"message": "Error creating entity type: {}".format(ex)}

@router.get("/get-entity-type/projects/{project_id}/locations/{location}/agents/{agent_id}/entityTypes/{entity_type_id}")
async def get_entity_type(project_id: str, location: str, agent_id: str, entity_type_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    entity_type_client = EntityTypesAsyncClient(client_options=client_options)
    entity_type_name = entity_type_client.entity_type_path(project_id, location, agent_id, entity_type_id)
    try:
        entity_type = await entity_type_client.get_entity_type(request={"name":entity_type_name})
        entities = []
        for entity in entity_type.entities:
            synonyms = []
            for synonym in entity.synonyms:
                synonyms.append(synonym)
            entities.append({"value": entity.value, "synonyms": synonyms})
        return {
            "name": entity_type.name,
            "display_name": entity_type.display_name,
            "kind": entity_type.kind.name,
            "auto_expansion_mode": entity_type.auto_expansion_mode.name,
            "entities": entities,
        }
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error getting entity type: {}'.format(ex)) 
        return {"message": "Error getting entity type: {}".format(ex)}

@router.get("/get-list-entity-type/projects/{project_id}/locations/{location}/agents/{agent_id}")
async def get_list_entity_type(project_id: str, location: str, agent_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)    
    agents_client = AgentsAsyncClient()
    entity_types_parent = agents_client.agent_path(project_id, location, agent_id)
    entity_type_client = EntityTypesAsyncClient(client_options=client_options)
    try:
        pager = await entity_type_client.list_entity_types(request={"parent":entity_types_parent})
        entity_types = []
        async for page in pager.pages:
            for entity_type in page.entity_types:
                entities = []
                for entity in entity_type.entities:
                    synonyms = []
                    for synonym in entity.synonyms:
                        synonyms.append(synonym)
                    entities.append({"value": entity.value, "synonyms": synonyms})
                entity_types.append({
                    "name": entity_type.name,
                    "display_name": entity_type.display_name,
                    "kind": entity_type.kind.name,
                    "auto_expansion_mode": entity_type.auto_expansion_mode.name,
                    "entities": entities
                })
        return entity_types
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error getting entity type: {}'.format(ex)) 
        return {"message": "Error getting entity type: {}".format(ex)}

@router.delete("/delete-entity-type/projects/{project_id}/locations/{location}/agents/{agent_id}/entityTypes/{entity_type_id}")
async def delete_entity_type(project_id: str, location: str, agent_id: str, entity_type_id: str, request: fastapi.Request, response: fastapi.Response):
    client_options = get_client_options(location)
    entity_type_client = EntityTypesAsyncClient(client_options=client_options)
    intents_client = IntentsAsyncClient(client_options=client_options)
    entity_type_name = entity_type_client.entity_type_path(project_id, location, agent_id, entity_type_id)
    try:
        intents_pager = await intents_client.list_intents(request={"parent": f"projects/{project_id}/locations/{location}/agents/{agent_id}"})
        async for intents_page in intents_pager.pages:
            for intent in intents_page.intents:
                modified_parameters = []
                for parameter in intent.parameters:
                    for training_phrase in intent.training_phrases:
                        for part in training_phrase.parts:
                            if part.parameter_id == parameter.id:
                                part.parameter_id = None
                    if parameter.entity_type != entity_type_name:
                        modified_parameters.append(parameter.entity_type)
                    if len(modified_parameters) != len(intent.parameters):
                        intent.parameters = modified_parameters
                        await intents_client.update_intent(request={"intent": intent})
        await entity_type_client.delete_entity_type(request={"name":entity_type_name})
        return {"result": "Entity type deleted successfully: {}".format(entity_type_name)}
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error getting entity type: {}'.format(ex)) 
        return {"message": "Error getting entity type: {}".format(ex)}

@router.patch("/update-entity-type/projects/{project_id}/locations/{location}/agents/{agent_id}/entityTypes/{entity_type_id}")
async def update_entity_type(project_id: str, location: str, agent_id: str, entity_type_id: str, request: fastapi.Request, response: fastapi.Response):
    entity_type_info = await request.json()
    client_options = get_client_options(location)
    entity_type_client = EntityTypesAsyncClient(client_options=client_options)
    entity_type_name = entity_type_client.entity_type_path(project_id, location, agent_id, entity_type_id)
    try:
        entity_type = await entity_type_client.get_entity_type(name=entity_type_name)
        entity_type.display_name = entity_type_info.get("display_name")
        entity_type.kind = entity_type_info.get("kind", "KIND_LIST")
        entity_type.entities = entity_type_info.get("entities", [])
        entity_type.auto_expansion_mode = entity_type_info.get("auto_expansion_mode", "AUTO_EXPANSION_MODE_UNSPECIFIED")
        updated_entity_type = await entity_type_client.update_entity_type(request={"entity_type": entity_type})
        print("Entity type updated successfully: {}".format(updated_entity_type.name))

        entities = []
        for entity in updated_entity_type.entities:
            synonyms = []
            for synonym in entity.synonyms:
                synonyms.append(synonym)
            entities.append({"value": entity.value, "synonyms": synonyms})
        return {
            "name": updated_entity_type.name,
            "display_name": updated_entity_type.display_name,
            "kind": updated_entity_type.kind.name,
            "auto_expansion_mode": updated_entity_type.auto_expansion_mode.name,
            "entities": entities,
        }
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error updating entity type: {}'.format(ex)) 
        return {"message": "Error updating entity type: {}".format(ex)}

#List locations
@router.get("/get-list-location/projects/{project_id}")
async def update_entity_type(project_id: str, request: fastapi.Request, response: fastapi.Response):
    try:
        with open('./credential.json', 'r') as file:
            token = await get_token(contents=file.read())
            async with httpx.AsyncClient() as client:
                resultJSON = await client.get(url=f"https://dialogflow.googleapis.com/v3/projects/{project_id}/locations", headers={"Authorization": "Bearer " + token.get("access_token")})
                result = resultJSON.json()
                locations = []
                for location in result.get("locations"):
                    locations.append(location.get("locationId"))
                return locations
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error getting location: {}'.format(ex)) 
        return {"message": "Error getting location: {}".format(ex)}
    
@router.get("/get-location/projects/{project_id}/locations/{location}")
async def update_entity_type(project_id: str, location: str, request: fastapi.Request, response: fastapi.Response):
    try:
        with open('./credential.json', 'r') as file:
            token = await get_token(contents=file.read())
            async with httpx.AsyncClient() as client:
                resultJSON = await client.get(url=f"https://dialogflow.googleapis.com/v3/projects/{project_id}/locations/{location}", headers={"Authorization": "Bearer " + token.get("access_token")})
                result = resultJSON.json()
                return result
    except Exception as ex:        
        response.status_code = get_code_ex(ex)
        print('Error getting location: {}'.format(ex)) 
        return {"message": "Error getting location: {}".format(ex)}

print("Start server dialogflow successfully")
