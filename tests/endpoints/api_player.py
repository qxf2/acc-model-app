"""
API_Player class does the following:
a) serves as an interface between the test and API_Interface
b) contains several useful wrappers around commonly used combination of actions
c) maintains the test context/state
"""
from base64 import b64encode
import logging
import urllib.parse
from .api_interface import APIInterface
from utils.results import Results
import random
from conf import api_acc_model_conf as conf


class APIPlayer(Results):
    "The class that maintains the test context/state"

    def __init__(self, url, log_file_path=None):
        "constructor"
        super().__init__(level=logging.DEBUG, log_file_path=log_file_path)
        self.api_obj = APIInterface(url=url)


    def set_auth_details(self, bearer_token):
        "sets the authorization header with the given bearer token"
        return f"Bearer {bearer_token}"


    def set_header_details(self, auth_details=None):
        "make header details"
        if auth_details != '' and auth_details is not None:
            headers = {'Authorization': f"{auth_details}"}
        else:
            headers = {'content-type': 'application/json'}
        return headers


    def create_acc_model(self, ACC_DETAILS, auth_details=None):
        "adds a new ACC model"
        result_flag = False
        data = ACC_DETAILS
        headers = self.set_header_details(auth_details)
        json_response = self.api_obj.create_acc_model(data=data, headers=headers)                                               
        return json_response

    
    def create_attribute(self, ATTRIBUTE_DETAILS, auth_details=None):
        "adds a new attribute"
        result_flag = False
        headers = self.set_header_details(auth_details)
        response = self.api_obj.create_attribute(data=ATTRIBUTE_DETAILS, headers=headers)
        return response
    

    # In APIPlayer class
    def create_component(self, component_details, auth_details=None):
        "Adds a new component"
        result_flag = False
        headers = self.set_header_details(auth_details)
        response = self.api_obj.create_component(data=component_details, headers=headers)
        return response


    def create_capability(self, capability_details, auth_details=None):
        "Adds a new capability"
        result_flag = False
        headers = self.set_header_details(auth_details)
        response = self.api_obj.create_capability(data=capability_details, headers=headers)
        return response


    def get_assessment_id(self, capability_id, attribute_id, RATING_DETAILS, auth_details=None):
        """Adds a new rating with specified capability and attribute"""
        result_flag = False
        headers = self.set_header_details(auth_details)
        response = self.api_obj.get_assessment_id(capability_id=capability_id, attribute_id=attribute_id, headers=headers)
        return response


    def submit_ratings(self, assessment_id, RATING_DETAILS, auth_details=None):
        "Adds a new rating with capability_id and attribute_id"
        result_flag = False
        headers = self.set_header_details(auth_details)
        response = self.api_obj.submit_ratings(assessment_id=assessment_id, data=RATING_DETAILS, headers=headers)
        return response


    def delete_acc_model(self, acc_model_id, auth_details=None):
        "Deletes an ACC model"
        result_flag = False
        headers = self.set_header_details(auth_details)
        response = self.api_obj.delete_acc_model(acc_model_id=acc_model_id, headers=headers)
        return response


    def delete_attribute(self, attribute_id, auth_details=None):
        "Deletes an attribute"
        result_flag = False
        headers = self.set_header_details(auth_details)
        response = self.api_obj.delete_attribute(attribute_id=attribute_id, headers=headers)
        return response
