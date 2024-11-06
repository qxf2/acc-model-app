import time
import os
import random
current_timestamp =str(int(time.time()))

#bearer token
bearer_token = os.environ.get('bearer_token')

import datetime

# Original configuration
acc_details = {'name': 'Trello', 'description': 'test'}
attribute_details = {'name': 'Fast', 'description': 'test'}
Component_details = {'name': 'Board', 'description': 'test', "acc_model_id": 3}

# Function to update name with timestamp
def update_name_with_timestamp(details):
    """Update the 'name' attribute of a dictionary with a timestamp."""
    # Get the current timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    # Update the name with the timestamp
    details['name'] = f"{details['name']}_{timestamp}"
    return details

# Example usage: update both dictionaries
acc_details = update_name_with_timestamp(acc_details)
attribute_details = update_name_with_timestamp(attribute_details)
component_details = update_name_with_timestamp(Component_details)
