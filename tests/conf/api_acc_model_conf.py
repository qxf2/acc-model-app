"""
Configuration for creating ACC models, attributes, components, and capabilities.
"""
# pylint: disable=invalid-name
import time
import os
import random

# Constant for current timestamp
current_timestamp = str(int(time.time()))

# Bearer token from environment variables
bearer_token = os.environ.get('bearer_token')
invalid_bearer_token = "invalid_bearer_token"

# ACC model details and attribute details
acc_details = {'name': 'Newsletter App' + current_timestamp,
               'description': 'Creating an acc model for newsletter app'}
attribute_details = {'name': 'Secure' + current_timestamp,
                     'description': 'Creating an attribute for newsletter app'}

# Rating details
rating_details = [
    "Stable",
    "Acceptable",
    "Low Impact",
    "Critical concern",
    "Not applicable"
]
rating_options = random.choice(rating_details)

# Create multiple ACC models
acc_models_name = "Survey app"
acc_models_description = "Creating an ACC model for survey app"
num_models = 3

# Create multiple attributes
attributes_name = "Fast"
attributes_description = "Creating an attribute for survey app"
num_attributes = 3

# Create multiple components
components_name = "Add articles"
components_description = "Creating a component for newsletter app"
num_components = 3

# Create multiple components
capability_name = "Registration"
capability_description = "Handles user registration"

# Components configuration for dynamic creation
components = [
    {"name": "Authentication module", "description": "Handles user authentication"},
    {"name": "User management module", "description": "Manages user profiles and roles"},
    {"name": "Notification module", "description": "Sends user notifications and alerts"}
]

# Mapping components to specific capabilities
capabilities = {
    "Authentication module": [
        {"name": "Registration", "description": "Handles user registration"},
        {"name": "Login", "description": "Handles user login"}
    ],
    "User management module": [
        {"name": "User Profile", "description": "Allows users to manage their profiles"},
        {"name": "Role Management", "description": "Manages user roles and permissions"}
    ],
    "Notification module": [
        {"name": "Email Notifications", "description": "Sends email notifications to users"},
        {"name": "Push Notifications", "description": "Sends push notifications to users"}
    ]
}
