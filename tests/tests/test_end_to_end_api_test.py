import os
import sys
import pytest
from conf import api_example_conf as conf
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer

@pytest.mark.API
def test_create_acc_model_component_and_capability(test_api_obj):
    """Run API test for creating an ACC model, attribute, component, and dependent capability"""

    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        acc_details = conf.acc_details
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Step 1: Create an ACC model
        acc_model_response = test_api_obj.create_acc_model(acc_details=acc_details, auth_details=auth_details)
        acc_model_result_flag = acc_model_response and acc_model_response.status_code == 200 and 'id' in acc_model_response.json()
        acc_model_id = acc_model_response.json().get('id') if acc_model_result_flag else None

        test_api_obj.log_result(
            acc_model_result_flag,
            positive=f"Successfully created ACC model with ID: {acc_model_id}",
            negative=f"Failed to create ACC model. Response: {acc_model_response.json() if acc_model_response else acc_model_response}"
        )

        # Step 2: Create an Attribute
        attribute_details = conf.attribute_details
        attribute_response = test_api_obj.create_attribute(attribute_details=attribute_details, auth_details=auth_details)
        attribute_result_flag = attribute_response and attribute_response.status_code == 200 and 'id' in attribute_response.json()

        test_api_obj.log_result(
            attribute_result_flag,
            positive=f"Successfully created attribute with details: {attribute_response.json()}",
            negative=f"Failed to create attribute with response: {attribute_response.json() if attribute_response else attribute_response}"
        )

        # Step 3: Create a Component only if ACC model creation succeeded
        if acc_model_result_flag:
            component_details = {
                'name': 'Board',
                'description': 'test',
                'acc_model_id': acc_model_id
            }
            component_response = test_api_obj.create_component(component_details=component_details, auth_details=auth_details)
            component_result_flag = component_response and component_response.status_code == 200 and 'id' in component_response.json()
            component_id = component_response.json().get('id') if component_result_flag else None

            test_api_obj.log_result(
                component_result_flag,
                positive=f"Successfully created component with ID: {component_id}",
                negative=f"Failed to create component with response: {component_response.json() if component_response else component_response}"
            )

            # Step 4: Create a Capability dependent on Component ID
            if component_result_flag:
                capability_details = {
                    'name': 'New Capability',
                    'description': 'Capability description',
                    'component_id': component_id  # Set dependency on the component
                }
                capability_response = test_api_obj.create_capability(capability_details=capability_details, auth_details=auth_details)
                capability_result_flag = capability_response and capability_response.status_code == 200 and 'id' in capability_response.json()

                test_api_obj.log_result(
                    capability_result_flag,
                    positive=f"Successfully created capability with details: {capability_response.json()}",
                    negative=f"Failed to create capability with response: {capability_response.json() if capability_response else capability_response}"
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
    test_create_acc_model_component_and_capability()
