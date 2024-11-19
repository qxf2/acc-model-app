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
rating_options = random.choice(rating_options)

# Create multiple ACC models
acc_models_name = "Survey app"
acc_models_description = "Creating ACC model name"
num_models = 3

# Create multiple attributes
attributes_name = "Fast"
attributes_description = "Creating attribute name"
num_attributes = 3

# Create multiple components
components_name = "Add articles"
components_description = "Creating component name"
num_components = 3

# Components configuration for dynamic creation
components = [
    {"name": "Authentication module", "description": "Handles user authentication"},
    {"name": "User management module", "description": "Manages user profiles and roles"},
    {"name": "Notification module", "description": "Sends user notifications and alerts"}
]

capabilities = [
    {"name": "Registration", "description": "Description for Capability Registration"},
    {"name": "Login", "description": "Description for Capability Login"},
    {"name": "Forget Password", "description": "Description for Capability Forget Password"}
]

rating_details = ['Stable', 'Acceptable', 'Low Impact', 'Critical concern', 'Not applicable']

