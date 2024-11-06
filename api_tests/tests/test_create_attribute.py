"""
API Test
Create attributes - POST request(without url_params)
"""

import os
import sys
import pytest
import logging
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from conf import api_example_conf as conf
from endpoints.api_player import APIPlayer

@pytest.mark.API
def test_create_attribute(test_api_obj):
    "Run API test for creating an attribute"

    try:
        expected_pass = 0
        actual_pass = -1

        # set authentication details
        bearer_token = conf.bearer_token
        auth_details = test_api_obj.set_auth_details(bearer_token)
        attribute_details = conf.attribute_details

        # Call create_attribute and get the response
        response = test_api_obj.create_attribute(attribute_details=attribute_details, auth_details=auth_details)

        result_flag = response.status_code == 200 and 'id' in response.json()
        test_api_obj.log_result(
            result_flag,
            positive=f"Successfully created attribute with details: {response.json()}",
            negative=f"Failed to create attribute with response: {response.json() if response else response}"
        )

        # Update pass/fail counters
        expected_pass = test_api_obj.total
        actual_pass = test_api_obj.passed

        # Write test summary
        test_api_obj.write_test_summary()

    except Exception as e:
        # Handle exceptions and log details
        print(e)
        test_api_obj.write(f"Exception when trying to run test: {__file__}")
        test_api_obj.write(f"Python says: {str(e)}")

    # Assertion to ensure test expectations are met
    assert expected_pass == actual_pass, f"Test failed: {__file__}"

if __name__ == '__main__':
    test_create_attribute()
