# from typing import Any, Text, Dict, List

# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher

# import spacy

# # load the spaCy model
# nlp = spacy.load("en_core_web_sm")

# class GetSentimentAction(Action):
#     def name(self) -> Text:
#         return "action_get_sentiment"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

#         # get the user message
#         user_message = tracker.latest_message.get('text', '')

#         # use spaCy to get the sentiment of the user message
#         doc = nlp(user_message)
#         sentiment = 'neutral'
#         for token in doc:
#             if token.sentiment:
#                 sentiment = token.sentiment_.polarity
        
#         # save the sentiment as metadata
#         return [metadata(sentiment=sentiment)]

# class ActionBookTable(Action):
#     def name(self) -> Text:
#         return "action_book_table"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         # Lưu trữ thông tin đặt bàn vào các slot tương ứng
#         num_guests = tracker.get_slot("num_guests")
#         time = tracker.get_slot("time")
#         name = tracker.get_slot("name")
#         phone = tracker.get_slot("phone")

#         # Gửi thông báo cho người dùng
#         message = "Cảm ơn bạn đã đặt bàn với {} khách vào lúc {} ngày mai. Chúng tôi sẽ gọi lại cho bạn để xác nhận đặt bàn.".format(num_guests, time)
#         dispatcher.utter_message(message)

#         # Trả về trạng thái thành công
#         return [SlotSet("name", name), SlotSet("phone", phone), SlotSet("num_guests", num_guests), SlotSet("time", time)]
