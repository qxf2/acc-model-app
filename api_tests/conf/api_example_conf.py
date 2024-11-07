import time
import os
import random
import datetime

current_timestamp = str(int(time.time()))

# Bearer token from environment variables
bearer_token = os.environ.get('bearer_token')

# Original configurations with placeholders for `acc_model_id`
acc_details = {'name': 'Trello', 'description': 'test'}
attribute_details = {'name': 'Fast', 'description': 'test'}

# Function to update name with timestamp
def update_name_with_timestamp(details):
    """Update the 'name' attribute of a dictionary with a timestamp."""
    # Get the current timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    # Update the name with the timestamp
    details['name'] = f"{details['name']}_{timestamp}"
    return details

# Example usage to create unique names for each run
acc_details = update_name_with_timestamp(acc_details)
attribute_details = update_name_with_timestamp(attribute_details)
