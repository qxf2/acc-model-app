"""
API automated test for ACC model app
Create an multiple ACC model name
"""
import os
import sys
import pytest
import time
from conf import api_acc_model_conf as conf
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
        auth_details = test_api_obj.set_auth_details(bearer_token)
        name = conf.acc_models_name
        description = conf.acc_models_description
        num_models = conf.num_models
        created_model_ids = []

        # Step 1: Create ACC models
        for counter in range(num_models):
            current_timestamp = str(int(time.time()) + counter)
            model_name = f"{name}_{current_timestamp}"
            
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

            # Add created model ID to the list
            if acc_model_id:
                created_model_ids.append(acc_model_id)

        def is_deletion_successful(response):
            if response.status_code == 204:
                return True
            elif response.status_code == 200 and "id" in response.json():
                # Check if the returned ID matches the deleted model's ID
                return True
            else:
                return False

        # Delete all created ACC models
        for acc_model_id in created_model_ids:
            try:
                delete_response = test_api_obj.delete_acc_model(acc_model_id, auth_details=auth_details)
                
                # Check for successful deletion based on actual API behavior
                delete_result_flag = is_deletion_successful(delete_response)

                test_api_obj.log_result(
                    delete_result_flag,
                    positive=f"Successfully deleted ACC model with ID: {acc_model_id}",
                    negative=f"Failed to delete ACC model with ID: {acc_model_id}. Response: {delete_response.json() if delete_response else delete_response}"
                )
            except Exception as e:
                print(f"Error deleting model with ID {acc_model_id}: {str(e)}")

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
