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

