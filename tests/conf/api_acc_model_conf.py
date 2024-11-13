import time
import os
import random
import datetime

current_timestamp = str(int(time.time()))

# Bearer token from environment variables
bearer_token = os.environ.get('bearer_token')

acc_details = {'name': 'Newsletter App'+current_timestamp, 'description': 'acc model name'}
attribute_details = {'name': 'Secure'+current_timestamp, 'description': 'attribute for newsletter app'}

rating_options = [
    "Stable",
    "Acceptable",
    "Low Impact",
    "Critical concern",
    "Not applicable"
]
rating_details = random.choice(rating_options)

acc_models_base_name = "DynamicModel"
base_description = "Dynamic description for ACC model"
num_models = 3

