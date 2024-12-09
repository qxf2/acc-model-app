"""
Configuration for creating ACC models, attributes, components, and capabilities.
"""

import time
import os
import random

# Constant for current timestamp
CURRENT_TIMESTAMP = str(int(time.time()))

# Bearer token from environment variables
bearer_token = os.environ.get('bearer_token')

# ACC model details and attribute details
ACC_DETAILS = {'name': 'Newsletter App' + CURRENT_TIMESTAMP,
               'description': 'Creating an acc model for newsletter app'}
ATTRIBUTE_DETAILS = {'name': 'Secure' + CURRENT_TIMESTAMP,
                     'description': 'Creating an attribute for newsletter app'}

# Rating details
RATING_DETAILS = [
    "Stable",
    "Acceptable",
    "Low Impact",
    "Critical concern",
    "Not applicable"
]
RATING_OPTIONS = random.choice(RATING_DETAILS)

# Create multiple ACC models
ACC_MODELS_NAME = "Survey app"
ACC_MODELS_DESCRIPTION = "Creating an ACC model for survey app"
NUM_MODELS = 3

# Create multiple attributes
ATTRIBUTES_NAME = "Fast"
ATTRIBUTES_DESCRIPTION = "Creating an attribute for survey app"
NUM_ATTRIBUTES = 3

# Create multiple components
COMPONENTS_NAME = "Add articles"
COMPONENTS_DESCRIPTION = "Creating a component for newsletter app"
NUM_COMPONENTS = 3

# Components configuration for dynamic creation
COMPONENTS = [
    {"name": "Authentication module",
     "description": "Handles user authentication"},
    {"name": "User management module",
     "description": "Manages user profiles and roles"},
    {"name": "Notification module",
     "description": "Sends user notifications and alerts"}
]

CAPABILITIES = [
    {"name": "Registration", "description": "Capability for Registration"},
    {"name": "Login", "description": "Capability for Login"},
    {"name": "Forget Password", "description": "Capability for Forget Password"}
]
