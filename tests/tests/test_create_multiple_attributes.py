"""
API automated test for ACC model app
1. Create an ACC model name
2. Create multiple attributes
"""
import os
import sys
import pytest
import time
from conf import api_acc_model_conf as conf  # Import dynamic acc_models from conf

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer

@pytest.mark.API
def test_api_create_multiple_attributes(test_api_obj):
    """
    Run API test for creating multiple ACC models using dynamic names.
    """
    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        auth_details = test_api_obj.set_auth_details(bearer_token)

        name = conf.attributes_name
        description = conf.attributes_description
        num_attributes = conf.num_models

        # Iterate and create ACC models dynamically
        for counter in range(num_attributes):
            current_timestamp = str(int(time.time()) + counter)
            attribute_name = f"{name}_{current_timestamp}"
            description = f"{description} {counter + 1}"
            
            attribute_details = {
                "name": attribute_name,
                "description": description
            }

            # Create an ACC model
            attribute_response = test_api_obj.create_attribute(
                attribute_details=attribute_details,
                auth_details=auth_details
            )
            attribute_result_flag = (
                attribute_response and 
                attribute_response.status_code == 200 and 
                'id' in attribute_response.json()
            )
            attribute_id = attribute_response.json().get('id') if attribute_result_flag else None

            # Log the result
            test_api_obj.log_result(
                attribute_result_flag,
                positive=f"Successfully created attributes with details: {attribute_response.json()}",
                negative=f"Failed to create attributes. Response: {attribute_response.json() if attribute_response else attribute_response}"
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
    assert expected_pass > 0, f"No checks were executed in the test: {__file__}"
    assert expected_pass == actual_pass, f"Test failed: {__file__}"


if __name__ == '__main__':
    test_api_create_multiple_attributes()
