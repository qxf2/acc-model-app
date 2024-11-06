"""
API Test
Create an ACC model - POST request (without url_params)
"""

import os
import sys
import pytest
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer
from conf import api_example_conf as conf

@pytest.mark.API
def test_create_acc_model_name(test_api_obj):
    """Run API test for creating an ACC model"""

    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        acc_details = conf.acc_details
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Create an ACC model
        response = test_api_obj.create_acc_model(acc_details=acc_details, auth_details=auth_details)
        
        # Evaluate response for success and log result
        result_flag = response.status_code == 200 and 'id' in response.json()
        test_api_obj.log_result(
            result_flag,
            positive=f"Successfully created ACC model with details: {response.json()}",
            negative=f"Failed to create ACC model with response: {response.json() if response else response}"
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
    test_create_acc_model_name()
