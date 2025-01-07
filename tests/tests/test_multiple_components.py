"""
API automated test for ACC model app
1. Create an ACC model name
2. Create multiple components for each ACC model name
3. Delete an ACC model
"""

import os
import sys
import pytest
from conf import api_acc_model_conf as conf
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.mark.API
def test_create_and_delete_multiple_components(test_api_obj):
    """
    Run API test for creating and deleting multiple components using dynamic names
    """
    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        acc_details = conf.acc_details
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Create an ACC model
        acc_response = test_api_obj.create_acc_model(acc_details=acc_details,
                                                    auth_details=auth_details)
        acc_result_flag = (
            acc_response is not None and
            acc_response.status_code==200 and
            'id' in acc_response.json())
        acc_model_id = acc_response.json().get('id') if acc_result_flag else None

        test_api_obj.log_result(
            acc_result_flag,
            positive=f"Successfully created ACC model: {acc_response.json()}",
            negative=(f"Failed to create ACC model. "
                      f"Response: {acc_response.json() if acc_response else acc_response}")
        )

        # Fail test if ACC model creation fails
        assert acc_model_id, "ACC model creation failed. Cannot proceed with component creation."

        # Create multiple Components for the ACC model
        component_ids = []
        for component in conf.components:
            # Add acc_model_id dependency
            component_details = {
                "name": component["name"],
                "description": component["description"],
                "acc_model_id": acc_model_id
            }

            # Create the component
            component_response = test_api_obj.create_component(component_details=component_details,
                                                             auth_details=auth_details)
            component_result_flag = (
                component_response is not None and
                component_response.status_code == 200 and
                'id' in component_response.json())
            component_id = component_response.json().get('id') if component_result_flag else None

            # Collect successful component IDs
            if component_result_flag:
                component_ids.append(component_id)

            # Log result for each component
            test_api_obj.log_result(
                component_result_flag,
                positive=f"Successfully created component '{component['name']}' with ID: {component_id}",
                negative=(f"Failed to create component '{component['name']}'. "
                f"Response: {component_response.json() if component_response else component_response}.")
            )

        # Ensure at least one component is created
        assert component_ids, "No components were created successfully."

        # Delete ACC model
        if acc_result_flag:
            delete_response = test_api_obj.delete_acc_model(acc_model_id=acc_model_id,
                                                            auth_details=auth_details)
            delete_result_flag = (
                delete_response is not None and
                delete_response.status_code == 200)

            test_api_obj.log_result(
                delete_result_flag,
                positive=f"Successfully deleted ACC model with ID: {acc_model_id}",
                negative=(f"Failed to delete ACC model. "
                f"Response: {delete_response.json() if delete_response else delete_response}.")
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

    # Final assertions
    assert expected_pass > 0, f"No checks were executed in the test: {__file__}"
    assert expected_pass == actual_pass, f"Test failed: {__file__}"
