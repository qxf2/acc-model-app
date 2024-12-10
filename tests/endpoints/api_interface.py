"""
A composed Interface for all the Endpoint abstraction objects:
* ACC Model API Endpoints
The APIPlayer Object interacts only to the Interface to access the Endpoint
"""

from .create_acc_model_endpoints import AccAPIEndpoints

class APIInterface(AccAPIEndpoints):
    "A composed interface for the API objects"

    def __init__(self, url):
        "Initialize the Interface"
        self.base_url = url
