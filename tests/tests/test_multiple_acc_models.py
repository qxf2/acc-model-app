"""
API automated test for ACC model app
1. Create new multiple ACC models
2. Delete the newly created ACC models
"""
import os
import sys
import time
import pytest
from conf import api_acc_model_conf as conf

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.mark.API
def test_multiple_acc_models(test_api_obj):
    """
    Run API test for creating multiple ACC models using dynamic names.
    """
    try:
        # Initialize counters
        expected_pass = 0
        actual_pass = -1

        bearer_token = conf.bearer_token
        invalid_bearer_token = conf.invalid_bearer_token
        name = conf.acc_models_name
        description = conf.acc_models_description
        num_models = conf.num_models


        # Set valid authentication details
        auth_details = test_api_obj.set_auth_details(bearer_token)
        created_model_ids = []

        # Step 1: Create ACC models with valid token
        for counter in range(num_models):
            current_timestamp = str(int(time.time()) + counter)
            model_name = f"{name}_{current_timestamp}"

            acc_details = {
                "name": model_name,
                "description": description
            }

            # API call to create ACC model
            acc_model_response = test_api_obj.create_acc_model(
                acc_details=acc_details,
                auth_details=auth_details,
            )

            # Check creation success
            acc_model_result_flag = (
                acc_model_response
                and acc_model_response.status_code == 200
                and "id" in acc_model_response.json()
            )

            # Log results
            test_api_obj.log_result(
                acc_model_result_flag,
                positive=f"Successfully created ACC model: {acc_model_response.json()}",
                negative=(f"Failed to create ACC model. Response: "
                          f"{acc_model_response.json() if acc_model_response else acc_model_response}"),
            )

            # Add model ID to the list for cleanup
            if acc_model_result_flag:
                created_model_ids.append(acc_model_response.json().get("id"))
            else:
                raise AssertionError("Failed to create ACC model.")

        # Step 2: Delete ACC models with valid token
        for acc_model_id in created_model_ids:
            delete_response = test_api_obj.delete_acc_model(
                acc_model_id,
                auth_details=auth_details,
            )

            # Check deletion success
            delete_result_flag = delete_response and delete_response.status_code in (200, 204)
            test_api_obj.log_result(
                delete_result_flag,
                positive=f"Successfully deleted ACC model with ID: {acc_model_id}",
                negative=(f"Failed to delete ACC model with ID: {acc_model_id}. "
                          f"Response: {delete_response.json() if delete_response else delete_response}"),
            )

        # test for validation http error 401 when no authentication
        auth_details = None
        result = test_api_obj.check_validation_error(auth_details)
        test_api_obj.log_result(not result['result_flag'],
                            positive=result['msg'],
                            negative=result['msg'])

        # test for validation http error 401 for invalid authentication
        # set invalid authentication details
        invalid_bearer_token = conf.invalid_bearer_token
        auth_details = test_api_obj.set_auth_details(invalid_bearer_token)
        result = test_api_obj.check_validation_error(auth_details)
        test_api_obj.log_result(not result['result_flag'],
                            positive=result['msg'],
                            negative=result['msg'])

        # Update pass/fail counters
        expected_pass = test_api_obj.total
        actual_pass = test_api_obj.passed

        # Write test summary
        test_api_obj.write_test_summary()

    except TypeError as e:
        error_msg = f"TypeError occurred in test: {__file__}. Python says: {str(e)}"
        print(error_msg)
        test_api_obj.write(error_msg)
        raise
    except Exception as e:
        # Handle all other exceptions
        error_msg = f"Exception occurred in test: {__file__}. Python says: {str(e)}"
        print(error_msg)
        test_api_obj.write(error_msg)
        raise

    # Final assertion
    assert expected_pass > 0, f"No checks were executed in the test: {__file__}"
    assert expected_pass == actual_pass, f"Test failed: {__file__}"
