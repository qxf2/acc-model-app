import os
import sys
import pytest
from conf import api_example_conf as conf
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer


@pytest.mark.API
def test_create_acc_model_and_component(test_api_obj):
    """Run API test for creating an ACC model and its dependent component"""

    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        acc_details = conf.acc_details  # Update acc_details with timestamp
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Create an ACC model
        response = test_api_obj.create_acc_model(acc_details=acc_details, auth_details=auth_details)
        
        # Check if ACC model creation was successful and retrieve the acc_model_id
        acc_model_result_flag = response and response.status_code == 200 and 'id' in response.json()
        acc_model_id = response.json().get('id') if acc_model_result_flag else None

        # Log result of ACC model creation
        test_api_obj.log_result(
            acc_model_result_flag,
            positive=f"Successfully created ACC model with ID: {acc_model_id}",
            negative=f"Failed to create ACC model. Response: {response.json() if response else response}"
        )

        if acc_model_result_flag:
            component_details = {
                'name': 'Board',
                'description': 'test',
                'acc_model_id': acc_model_id
            }

        response = test_api_obj.create_component(component_details=component_details, auth_details=auth_details)  # Call create_component_details=attribute_details, auth_details=auth_details)

        result_flag = response.status_code == 200 and 'id' in response.json()
        test_api_obj.log_result(
            result_flag,
            positive=f"Successfully created component with details: {response.json()}",
            negative=f"Failed to create component with response: {response.json() if response else response}"
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
    test_create_acc_model_and_component()
