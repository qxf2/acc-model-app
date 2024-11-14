import time
import os
import random
import datetime

current_timestamp = str(int(time.time()))

# Bearer token from environment variables
bearer_token = os.environ.get('bearer_token')

# ACC model details and attribute details
acc_details = {'name': 'Newsletter App'+current_timestamp, 'description': 'acc model name'}
attribute_details = {'name': 'Secure'+current_timestamp, 'description': 'attribute for newsletter app'}

# Rating details
rating_options = [
    "Stable",
    "Acceptable",
    "Low Impact",
    "Critical concern",
    "Not applicable"
]
rating_details = random.choice(rating_options)

# Create multiple ACC models
acc_models_base_name = "Survey app"
base_description = "Creating ACC model name"
num_models = 3

# Create multiple attributes
attributes_base_name = "Fast"
base_description = "Creating attribute name"
num_attributes = 3
