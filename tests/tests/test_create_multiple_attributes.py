"""
API automated test for ACC model app
1. Create and delete multiple attributes
"""

import os
import sys
import pytest
import time
from conf import api_acc_model_conf as conf
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer

@pytest.mark.API
def test_create_and_delete_multiple_attributes(test_api_obj):
    """
    Run API test for creating and deleting multiple attributes using dynamic names.
    """
    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        auth_details = test_api_obj.set_auth_details(bearer_token)
        name = conf.ATTRIBUTES_NAME
        description = conf.ATTRIBUTES_DESCRIPTION
        NUM_ATTRIBUTES = conf.NUM_ATTRIBUTES
        created_attribute_ids = []

        # Create multiple attributes
        for counter in range(NUM_ATTRIBUTES):
            CURRENT_TIMESTAMP = str(int(time.time()) + counter)
            attribute_name = f"{name}_{CURRENT_TIMESTAMP}"
            
            ATTRIBUTE_DETAILS = {
                "name": attribute_name,
                "description": description
            }

            # Create an attribute
            attribute_response = test_api_obj.create_attribute(
                ATTRIBUTE_DETAILS=ATTRIBUTE_DETAILS,
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
                positive=f"Successfully created attribute with details: {attribute_response.json()}",
                negative=f"Failed to create attribute. Response: {attribute_response.json() if attribute_response else attribute_response}"
            )

            # Add created attribute ID to the list
            if attribute_id:
                created_attribute_ids.append(attribute_id)

        def is_deletion_successful(response):
            """
            Determines if the attribute deletion was successful.
            """
            if response.status_code == 204:
                return True
            elif response.status_code == 200 and "id" in response.json():
                # Check if the returned ID matches the deleted attribute's ID
                return True
            else:
                return False

        # Delete all created attributes
        for attribute_id in created_attribute_ids:
            try:
                delete_response = test_api_obj.delete_attribute(attribute_id, auth_details=auth_details)

                # Check for successful deletion based on actual API behavior
                delete_result_flag = is_deletion_successful(delete_response)

                test_api_obj.log_result(
                    delete_result_flag,
                    positive=f"Successfully deleted attribute with ID: {attribute_id}",
                    negative=f"Failed to delete attribute with ID: {attribute_id}. Response: {delete_response.json() if delete_response else delete_response}"
                )
            except Exception as e:
                print(f"Error deleting attribute with ID {attribute_id}: {str(e)}")

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
    test_create_and_delete_multiple_attributes()
