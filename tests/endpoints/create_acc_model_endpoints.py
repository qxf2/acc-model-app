"""
API methods for endpoints
"""
from .base_api import BaseAPI

class AccAPIEndpoints(BaseAPI):
    """Class for ACC model endpoints"""

    def acc_url(self, suffix=''):
        "Append endpoint to base URL"
        return self.base_url + suffix


    def create_acc_model(self, data, headers):
        "Adds a new ACC model"
        url = self.acc_url('/acc-models')
        response = self.post(url, json=data, headers=headers)
        return response


    def create_attribute(self, data, headers):
        "Adds a new attribute"
        url = self.acc_url('/attributes')
        response = self.post(url, json=data, headers=headers)
        return response


    def create_component(self, data, headers):
        "Adds a new component"
        url = self.acc_url('/components')
        response = self.post(url, json=data, headers=headers)
        return response
    

    def create_capability(self, data, headers):
        "Adds a new capability"
        url = self.acc_url('/capabilities')
        response = self.post(url, json=data, headers=headers)
        return response


    def get_assessment_id(self, capability_id, attribute_id, headers):
        "Adds a new rating with capability_id and attribute_id"
        url = self.acc_url(f'/capability-assessments/?capability_id={capability_id}&attribute_id={attribute_id}')
        response = self.get(url, headers=headers)
        return response


    def submit_ratings(self, assessment_id, data, headers):
        "Adds a new rating with assessment_id"
        url = self.acc_url(f'/capability-assessments/{assessment_id}')
        response = self.post(url, json=data, headers=headers)
        return response

    
    def delete_acc_model(self, acc_model_id, headers):
        "Deletes an ACC model"
        url = self.acc_url(f'/acc-models/{acc_model_id}')
        response = self.delete(url, headers=headers)
        return response


    def delete_attribute(self, attribute_id, headers):
        "Deletes an attribute"        
        url = self.acc_url(f'/attributes/{attribute_id}')
        response = self.delete(url, headers=headers)
        return response
        