"""
API automated test for ACC model app
1. Create and delete multiple attributes
"""

import os
import sys
import time
import pytest
from conf import api_acc_model_conf as conf

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.mark.API
def test_create_and_delete_multiple_attributes(test_api_obj):
    """
    Run API test for creating and deleting multiple attributes using dynamic names.
    """
    try:
        # Initialize pass/fail counters
        expected_pass = 0
        actual_pass = 0

        # Set authentication details
        bearer_token = conf.bearer_token
        auth_details = test_api_obj.set_auth_details(bearer_token)
        name = conf.attributes_name
        description = conf.attributes_description
        num_attributes = conf.num_attributes
        created_attribute_ids = []

        # Step 1: Create multiple attributes
        for counter in range(num_attributes):
            current_timestamp = str(int(time.time()) + counter)
            attribute_name = f"{name}_{current_timestamp}"

            attribute_details = {
                "name": attribute_name,
                "description": description
            }

            # Create an attribute
            attribute_response = test_api_obj.create_attribute(
                attribute_details=attribute_details,
                auth_details=auth_details
            )

            # Check result of the creation
            if attribute_response and attribute_response.status_code == 200:
                attribute_result_flag = True
                attribute_id = attribute_response.json().get('id')
                if attribute_id:
                    created_attribute_ids.append(attribute_id)
            else:
                attribute_result_flag = False

            # Log result for attribute creation
            test_api_obj.log_result(
                attribute_result_flag,
                positive=(f"Successfully created attribute with details: {attribute_response.json() if attribute_response else ''}"),
                negative=(f"Failed to create attribute. Response: {attribute_response.json() if attribute_response else attribute_response}")
            )

        # Step 2: Delete created attributes
        for attribute_id in created_attribute_ids:
            try:
                delete_response = test_api_obj.delete_attribute(attribute_id,
                                    auth_details=auth_details)
                delete_result_flag = (
                    delete_response is not None and
                    delete_response.status_code in (200, 204))

                # Log result for attribute deletion
                test_api_obj.log_result(
                    delete_result_flag,
                    positive=f"Successfully deleted attribute with ID: {attribute_id}",
                    negative=f"Failed to delete attribute with ID: {attribute_id}. Response: {delete_response.json() if delete_response else delete_response}"
                )

            except Exception as e:
                print(f"Error deleting attribute with ID {attribute_id}: {str(e)}")
                test_api_obj.log_result(False, negative=f"Exception occurred while deleting attribute ID {attribute_id}: {str(e)}")

        # Step 3: Test 401 error validation with no authentication
        auth_details = None
        result = test_api_obj.check_validation_error(auth_details)
        assert not result['result_flag'],"Expected 401 Unauthorized error,but the request succeeded"
        test_api_obj.log_result(
            not result['result_flag'],
            positive=result['msg'],
            negative=result['msg']
        )

        # Step 4: Test 401 error validation with invalid authentication
        invalid_bearer_token = conf.invalid_bearer_token
        auth_details = test_api_obj.set_auth_details(invalid_bearer_token)
        result = test_api_obj.check_validation_error(auth_details)
        assert not result['result_flag'],"Expected 401 Unauthorized error,but the request succeeded"
        test_api_obj.log_result(
            not result['result_flag'],
            positive=result['msg'],
            negative=result['msg']
        )

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
        error_msg = f"Exception occurred in test: {__file__}. Python says: {str(e)}"
        print(error_msg)
        test_api_obj.write(error_msg)
        raise

    # Final assertions
    assert expected_pass > 0, f"No checks were executed in the test: {__file__}"
    assert expected_pass == actual_pass, f"Test failed: {__file__}"
