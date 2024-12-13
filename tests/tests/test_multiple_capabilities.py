"""
API automated test for ACC model app
1. Create ACC models
2. Create multiple capabilities
3. Create multiple components
4. Delete all ACC models which were created
5. Delete an ACC model
"""

import os
import sys
import pytest
from conf import api_acc_model_conf as conf
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.mark.API
def test_multiple_capabilities(test_api_obj):
    "Function to create multiple capabilities for respective components"
    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        acc_details = conf.acc_details
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Create an ACC model
        acc_model_response = test_api_obj.create_acc_model(acc_details=acc_details, auth_details=auth_details)
        acc_model_result_flag = acc_model_response and acc_model_response.status_code == 200 and 'id' in acc_model_response.json()
        acc_model_id = acc_model_response.json().get('id') if acc_model_result_flag else None

        test_api_obj.log_result(
            acc_model_result_flag,
            positive=f"Successfully created ACC model with details: {acc_model_response.json()}",
            negative=f"Failed to create ACC model. Response: {acc_model_response.json() if acc_model_response else acc_model_response}"
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
            component_response = test_api_obj.create_component(component_details=component_details, auth_details=auth_details)
            component_result_flag = component_response and component_response.status_code == 200 and 'id' in component_response.json()
            component_id = component_response.json().get('id') if component_result_flag else None

            # Collect successful component IDs
            if component_result_flag:
                component_ids.append(component_id)

            # Log result for each component
            test_api_obj.log_result(
                component_result_flag,
                positive=f"Successfully created component '{component['name']}' with ID: {component_id}",
                negative=f"Failed to create component '{component['name']}'. Response: {component_response.json() if component_response else component_response}."
            )

        # Ensure at least one component is created
        assert component_ids, "No components were created successfully."

        # Create Capabilities for each Component
        for component_id in component_ids:
            # Find the component name by matching the component_id
            component_name = None
            for component in conf.components:
                if component["name"] in conf.capabilities:
                    component_name = component["name"]
                    break

            if component_name:
                # Retrieve the list of capabilities for this component
                component_capabilities = conf.capabilities.get(component_name, [])

                # Initialize the result flag for capabilities creation
                capabilities_creation_result = True

                # Create capabilities for the current component
                for capability in component_capabilities:
                    capability_details = {
                        "name": capability["name"],
                        "description": capability["description"],
                        "component_id": component_id
                    }

                    # Create the capability
                    capability_response = test_api_obj.create_capability(capability_details=capability_details, auth_details=auth_details)
                    capability_result_flag = capability_response and capability_response.status_code == 200

                    if capability_result_flag:
                        # Log the response for debugging
                        test_api_obj.log_result(
                            capability_result_flag,
                            positive=f"Successfully created capability '{capability['name']}' for component '{component_name}' with ID: {capability_response.json()}",
                            negative=f"Failed to create capability '{capability['name']}' for component '{component_name}'. Response: {capability_response.text}"
                        )
                    else:
                        capabilities_creation_result = False
                        test_api_obj.log_result(
                            False,
                            positive="",
                            negative=f"Failed to create capability '{capability['name']}' for component '{component_name}'. Response: {capability_response.text if capability_response else 'No response'}"
                        )

                # If capabilities were not created for any of the components, raise an assertion error
                assert capabilities_creation_result, f"Capabilities creation failed for component '{component_name}'."
            else:
                print(f"Component with ID {component_id} does not have defined capabilities in the configuration.")

        # Delete ACC model
        if acc_model_result_flag:
            delete_response = test_api_obj.delete_acc_model(acc_model_id=acc_model_id, auth_details=auth_details)
            delete_result_flag = delete_response and delete_response.status_code == 200

            test_api_obj.log_result(
                delete_result_flag,
                positive=f"Successfully deleted ACC model with ID: {acc_model_id}",
                negative=f"Failed to delete ACC model. Response: {delete_response.json() if delete_response else delete_response}."
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
    except Exception as e:  # pylint: disable=broad-exception-caught
        # Handle all other exceptions that weren't caught earlier
        error_msg = f"Exception occurred in test: {__file__}. Python says: {str(e)}"
        print(error_msg)
        test_api_obj.write(error_msg)

    # Final assertions
    assert expected_pass > 0, f"No checks were executed in the test: {__file__}"
    assert expected_pass == actual_pass, f"Test failed: {__file__}"
