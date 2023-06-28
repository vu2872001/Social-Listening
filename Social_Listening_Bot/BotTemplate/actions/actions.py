# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher
# from custom_functions import get_link


class ActionHelloWorld(Action):
    def name(self) -> Text:
        return "action_hello_world"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(text="Hello World!")

        return []


# class GetLink(Action):
#     def name(self):
#         return "action_get_link"

#     def run(self, dispatcher, tracker, domain):
#         # link_id = tracker.link_id
#         link = get_link()
#         print(link)
#         dispatcher.utter_message(response="utter_link_info", link=link)

#         return []
        # set user info slots
        # return [SlotSet("link", link)]
