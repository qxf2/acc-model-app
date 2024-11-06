"""
API Test
Create ACC model and Component - POST requests
"""

import os
import sys
import pytest
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer
from conf import api_example_conf as conf

@pytest.mark.API
def test_create_acc_model_and_component(test_api_obj):
    """Run API test for creating an ACC model and its dependent component"""

    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        acc_details = conf.acc_details
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Create an ACC model
        response = test_api_obj.create_acc_model(acc_details=acc_details, auth_details=auth_details)
        
        # Check if ACC model creation was successful and retrieve the acc_model_id
        acc_model_result_flag = response.status_code == 200 and 'id' in response.json()
        acc_model_id = response.json().get('id') if acc_model_result_flag else None

        # Log result of ACC model creation
        test_api_obj.log_result(
            acc_model_result_flag,
            positive=f"Successfully created ACC model with ID: {acc_model_id}",
            negative=f"Failed to create ACC model. Response: {response.json() if response else response}"
        )

        # Create a Component that depends on the acc_model_id
        if acc_model_result_flag:
            component_details = conf.component_details
            # Adding acc_model_id to headers or body as needed
            headers_with_acc_id = {
                **test_api_obj.set_header_details(auth_details),
                'acc-model-id': str(acc_model_id)  # Adjust header key as required
            }
            component_response = test_api_obj.create_component(
                component_details=component_details, 
                headers=headers_with_acc_id
            )

            # Evaluate component creation response
            component_result_flag = component_response.status_code == 200 and 'component_id' in component_response.json()
            test_api_obj.log_result(
                component_result_flag,
                positive=f"Successfully created component with details: {component_response.json()}",
                negative=f"Failed to create component. Response: {component_response.json() if component_response else component_response}"
            )

            # Update pass/fail counters
            expected_pass = test_api_obj.total
            actual_pass = test_api_obj.passed

        # Write test summary
        test_api_obj.write_test_summary()

    except Exception as e:
        # Handle exceptions and log details
        error_msg = f"Exception occurred in test: {__file__}. Python says: {str(e)}"
        print(error_msg)
        test_api_obj.write(error_msg)

    # Final assertion
        assert expected_pass == actual_pass, f"Test failed: {__file__}" 

if __name__ == '__main__':
    test_create_acc_model_and_component()
