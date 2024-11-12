import time
import os
import random
import datetime

current_timestamp = str(int(time.time()))

# Bearer token from environment variables
bearer_token = os.environ.get('bearer_token')

acc_details = {'name': 'Trello', 'description': 'test'}
attribute_details = {'name': 'Fast', 'description': 'test'}

def update_name_with_timestamp(details):
    timestamp = datetime.datetime.now().strftime("%d_%H%M%S")
    details['name'] = f"{details['name']}_{timestamp}"
    return details

# Example usage to create unique names for each run
acc_details = update_name_with_timestamp(acc_details)
attribute_details = update_name_with_timestamp(attribute_details)

rating_options = [
    "Stable",
    "Acceptable",
    "Low Impact",
    "Critical concern",
    "Not applicable"
]
rating_details = random.choice(rating_options)
