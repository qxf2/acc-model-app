"""
API_Player class does the following:
a) serves as an interface between the test and API_Interface
b) contains several useful wrappers around commonly used combination of actions
c) maintains the test context/state
"""

import logging
from utils.results import Results
from .api_interface import APIInterface


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


    def create_acc_model(self, acc_details, auth_details=None):
        "adds a new ACC model"
        data = acc_details
        headers = self.set_header_details(auth_details)
        json_response = self.api_obj.create_acc_model(data=data, headers=headers)
        return json_response


    def create_attribute(self, attribute_details, auth_details=None):
        "adds a new attribute"
        headers = self.set_header_details(auth_details)
        response = self.api_obj.create_attribute(data=attribute_details, headers=headers)
        return response


    # In APIPlayer class
    def create_component(self, component_details, auth_details=None):
        "Adds a new component"
        headers = self.set_header_details(auth_details)
        response = self.api_obj.create_component(data=component_details, headers=headers)
        return response


    def create_capability(self, capability_details, auth_details=None):
        "Adds a new capability"
        headers = self.set_header_details(auth_details)
        response = self.api_obj.create_capability(data=capability_details, headers=headers)
        return response


    def get_assessment_id(self, capability_id, rating_details, attribute_id, auth_details=None):
        "Fetches assessment id"
        headers = self.set_header_details(auth_details)
        response = self.api_obj.get_assessment_id(
            capability_id=capability_id,
            attribute_id=attribute_id,
            headers=headers)
        return response


    def submit_ratings(self, assessment_id, rating_details, auth_details=None):
        "Adds a new rating with capability_id and attribute_id"
        headers = self.set_header_details(auth_details)
        response = self.api_obj.submit_ratings(
            assessment_id=assessment_id,
            data=rating_details,
            headers=headers)
        return response


    def delete_acc_model(self, acc_model_id, auth_details=None):
        "Deletes an ACC model"
        headers = self.set_header_details(auth_details)
        response = self.api_obj.delete_acc_model(acc_model_id=acc_model_id, headers=headers)
        return response


    def delete_attribute(self, attribute_id, auth_details=None):
        "Deletes an attribute"
        headers = self.set_header_details(auth_details)
        response = self.api_obj.delete_attribute(attribute_id=attribute_id, headers=headers)
        return response
    
    def get_user_list(self, auth_details=None):
        "get user list"
        headers = self.set_header_details(auth_details)
        try:
            result = self.api_obj.get_user_list(headers=headers)
            self.write(f"Request & Response: {result}")
        except (TypeError, AttributeError) as e:
            raise e
        return {'user_list': result['user_list'], 'response_code': result['response']}

    def check_validation_error(self, auth_details=None):
        "verify validatin error 403"
        result = self.get_user_list(auth_details)
        response_code = result['response_code']
        result_flag = False
        msg = ''

        if  response_code == 403:
            msg = "403 FORBIDDEN: Authentication successful but no access for non admin users"

        elif response_code == 200:
            result_flag = True
            msg = "successful authentication and access permission"

        elif response_code == 401:
            msg = "401 UNAUTHORIZED: Authenticate with proper credentials OR Require Basic Authentication"

        elif response_code == 404:
            msg = "404 NOT FOUND: URL not found"

        else:
            msg = "unknown reason"

        return {'result_flag': result_flag, 'msg': msg}
