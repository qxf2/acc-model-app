import os
import sys
import pytest
import time
from conf import api_acc_model_conf as conf  # Import dynamic acc_models from conf

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer

@pytest.mark.API
def test_api_create_multiple_acc_models(test_api_obj):
    """
    Run API test for creating multiple ACC models using dynamic names.
    """
    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        #acc_models = conf.acc_models  # Use dynamically updated models
        auth_details = test_api_obj.set_auth_details(bearer_token)

        base_name = conf.acc_models_base_name
        base_description = conf.base_description
        num_models = conf.num_models

        # Iterate and create ACC models dynamically
        for counter in range(num_models):
            current_timestamp = str(int(time.time()) + counter)
            model_name = f"{base_name}_{current_timestamp}"
            description = f"{base_description} {counter + 1}"
            
            acc_details = {
                "name": model_name,
                "description": description
            }


            # Create an ACC model
            acc_model_response = test_api_obj.create_acc_model(
                acc_details=acc_details,
                auth_details=auth_details
            )
            acc_model_result_flag = (
                acc_model_response and 
                acc_model_response.status_code == 200 and 
                'id' in acc_model_response.json()
            )
            acc_model_id = acc_model_response.json().get('id') if acc_model_result_flag else None

            # Log the result
            test_api_obj.log_result(
                acc_model_result_flag,
                positive=f"Successfully created ACC model with details: {acc_model_response.json()}",
                negative=f"Failed to create ACC model. Response: {acc_model_response.json() if acc_model_response else acc_model_response}"
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
    test_api_create_multiple_acc_models()
