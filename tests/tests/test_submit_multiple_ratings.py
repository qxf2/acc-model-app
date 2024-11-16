"""
API automated test for ACC model app
1. Create an ACC model
2. Create multiple attributes
3. Create components for the ACC model
4. Create capabilities for each component
5. Submit ratings for capabilities with different ratings
"""
import os
import sys
import pytest
import time
import random
from conf import api_acc_model_conf as conf  # Import dynamic data from conf

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from endpoints.api_player import APIPlayer

@pytest.mark.API
def test_acc_model_with_attributes_components_capabilities_and_ratings(test_api_obj):
    try:
        expected_pass = 0
        actual_pass = -1

        # Step 1: Set authentication details
        bearer_token = conf.bearer_token
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Step 2: Create an ACC model
        acc_details = conf.acc_details
        acc_model_response = test_api_obj.create_acc_model(acc_details=acc_details, auth_details=auth_details)
        acc_model_result_flag = acc_model_response and acc_model_response.status_code == 200 and 'id' in acc_model_response.json()
        acc_model_id = acc_model_response.json().get('id') if acc_model_result_flag else None

        test_api_obj.log_result(
            acc_model_result_flag,
            positive=f"Successfully created ACC model with details: {acc_model_response.json()}",
            negative=f"Failed to create ACC model. Response: {acc_model_response.json() if acc_model_response else acc_model_response}"
        )

        # Fail test if ACC model creation fails
        assert acc_model_id, "ACC model creation failed. Cannot proceed with the test."

        # Step 3: Create multiple attributes
        attributes = []
        for counter in range(conf.num_attributes):
            current_timestamp = str(int(time.time()) + counter)
            attribute_name = f"{conf.attributes_name}_{current_timestamp}"
            attribute_description = f"{conf.attributes_description} {counter + 1}"

            attribute_details = {
                "name": attribute_name,
                "description": attribute_description
            }

            attribute_response = test_api_obj.create_attribute(attribute_details=attribute_details, auth_details=auth_details)
            attribute_result_flag = (
                attribute_response and
                attribute_response.status_code == 200 and
                'id' in attribute_response.json()
            )
            attribute_id = attribute_response.json().get('id') if attribute_result_flag else None

            if attribute_result_flag:
                attributes.append(attribute_id)

            test_api_obj.log_result(
                attribute_result_flag,
                positive=f"Successfully created attribute '{attribute_name}' with ID: {attribute_id}",
                negative=f"Failed to create attribute '{attribute_name}'. Response: {attribute_response.json() if attribute_response else attribute_response}"
            )

        # Ensure attributes are created
        assert attributes, "No attributes were created successfully."

        # Step 4: Create components
        component_ids = []
        for component in conf.components:
            component_details = {
                "name": component["name"],
                "description": component["description"],
                "acc_model_id": acc_model_id
            }

            component_response = test_api_obj.create_component(component_details=component_details, auth_details=auth_details)
            component_result_flag = component_response and component_response.status_code == 200 and 'id' in component_response.json()
            component_id = component_response.json().get('id') if component_result_flag else None

            if component_result_flag:
                component_ids.append(component_id)

            test_api_obj.log_result(
                component_result_flag,
                positive=f"Successfully created component '{component['name']}' with ID: {component_id}",
                negative=f"Failed to create component '{component['name']}'. Response: {component_response.json() if component_response else component_response}."
            )

        # Ensure components are created
        assert component_ids, "No components were created successfully."

        # Step 5: Create capabilities and submit ratings with different ratings for each capability
        for component_id in component_ids:
            for capability in conf.capabilities:
                capability_details = {
                    "name": capability["name"],
                    "description": capability["description"],
                    "component_id": component_id
                }

                capability_response = test_api_obj.create_capability(capability_details=capability_details, auth_details=auth_details)
                capability_result_flag = capability_response and capability_response.status_code == 200 and 'id' in capability_response.json()
                capability_id = capability_response.json().get('id') if capability_result_flag else None

                test_api_obj.log_result(
                    capability_result_flag,
                    positive=f"Successfully created capability '{capability['name']}' for component ID {component_id} with ID: {capability_id}",
                    negative=f"Failed to create capability '{capability['name']}' for component ID {component_id}. Response: {capability_response.json() if capability_response else capability_response}."
                )

                if capability_result_flag:
                    for attribute_id in attributes:
                        # Randomly select a rating from predefined list
                        rating_details = random.choice(conf.rating_details)  # Random rating from conf.rating_details
                        assessment_response = test_api_obj.get_assessment_id(
                            capability_id=capability_id,
                            attribute_id=attribute_id,
                            rating_details=rating_details,
                            auth_details=auth_details
                        )

                        assessment_result_flag = assessment_response and assessment_response.status_code == 200
                        assessment_id = assessment_response.json().get('id') if assessment_result_flag else None

                        test_api_obj.log_result(
                            assessment_result_flag,
                            positive=f"Successfully retrieved assessment ID: {assessment_id}",
                            negative=f"Failed to retrieve assessment ID. Response: {assessment_response.json() if assessment_response else assessment_response}."
                        )

                        if assessment_result_flag:
                            # Submit Rating
                            rating_payload = {
                                'capability_assessment_id': assessment_id,
                                'rating': rating_details,
                                'comment': 'Submitting rating for attribute and capability'
                            }

                            rating_response = test_api_obj.submit_ratings(
                                assessment_id=assessment_id,
                                rating_details=rating_payload,
                                auth_details=auth_details
                            )

                            rating_result_flag = rating_response and rating_response.status_code == 200
                            test_api_obj.log_result(
                                rating_result_flag,
                                positive=f"Successfully submitted rating with details: {rating_response.json()}",
                                negative=f"Failed to submit rating with response: {rating_response.json() if rating_response else rating_response}."
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
    test_acc_model_with_attributes_components_capabilities_and_ratings()
