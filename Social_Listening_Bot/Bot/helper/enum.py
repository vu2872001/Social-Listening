IMPORT_LIBRARY_TEXT = f"""
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher
from textblob import TextBlob
"""

CREATE_SAMPLE_ACTION = """
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