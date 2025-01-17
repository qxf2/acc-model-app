"""
API automated test for ACC model app
1. Create a new ACC model name
2. Create an attribute
3. Create a component
4. Create a capability
5. Submit ratings
6. Delete newly created ACC model
"""

import os
import sys
import pytest
from conf import api_acc_model_conf as conf
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.mark.API
def test_api_end_to_end(test_api_obj):
    "Run API test for creating an ACC model,attribute,component,capability and submit ratings"
    try:
        expected_pass = 0
        actual_pass = -1

        # Set authentication details
        bearer_token = conf.bearer_token
        acc_details = conf.acc_details
        capability_details = conf.capability_details
        auth_details = test_api_obj.set_auth_details(bearer_token)

        # Create an ACC model
        acc_model_response = test_api_obj.create_acc_model(
            acc_details=acc_details,
            auth_details=auth_details
        )
        acc_model_result_flag = (
            acc_model_response is not None and
            acc_model_response.status_code == 200 and
            'id' in acc_model_response.json()
        )
        acc_model_id = acc_model_response.json().get('id') if acc_model_result_flag else None

        # Assert if ACC model creation is successful
        assert acc_model_result_flag, (
            f"Failed to create ACC model. Response: "
            f"{acc_model_response.json() if acc_model_response else acc_model_response}"
        )

        test_api_obj.log_result(
            acc_model_result_flag,
            positive=f"Successfully created ACC model with details: {acc_model_response.json()}",
            negative=(
                f"Failed to create ACC model. Response: "
                f"{acc_model_response.json() if acc_model_response else acc_model_response}"
            )
        )

        # Create an Attribute
        attribute_details = conf.attribute_details
        attribute_response = test_api_obj.create_attribute(
            attribute_details=attribute_details,
            auth_details=auth_details
        )
        attribute_result_flag = (
            attribute_response is not None and
            attribute_response.status_code == 200 and
            'id' in attribute_response.json()
        )
        attribute_id = attribute_response.json().get('id') if attribute_result_flag else None

        # Assert if Attribute creation is successful
        assert attribute_result_flag, (
            f"Failed to create attribute. Response: "
            f"{attribute_response.json() if attribute_response else attribute_response}"
        )

        test_api_obj.log_result(
            attribute_result_flag,
            positive=f"Successfully created attribute with details: {attribute_response.json()}",
            negative=(
                f"Failed to create attribute with response: "
                f"{attribute_response.json() if attribute_response else attribute_response}."
            )
        )

        # Create a Component only if ACC model creation succeeded
        if acc_model_result_flag:
            component_details = {
                'name': conf.components_name,
                'description': conf.components_description,
                'acc_model_id': acc_model_id
            }
            component_response = test_api_obj.create_component(
                component_details=component_details,
                auth_details=auth_details
            )
            component_result_flag = (
                component_response is not None and
                component_response.status_code == 200 and
                'id' in component_response.json()
            )
            component_id = component_response.json().get('id') if component_result_flag else None

            test_api_obj.log_result(
                component_result_flag,
                positive=f"Successfully created component with ID: {component_id}",
                negative=(
                    f"Failed to create component with response: "
                    f"{component_response.json() if component_response else component_response}."
                )
            )

            # Create a Capability dependent on Component ID
            if component_result_flag:
                capability_details = {
                    'name': conf.capability_name,
                    'description': conf.capability_description,
                    'component_id': component_id
                }
                capability_response = test_api_obj.create_capability(
                    capability_details=capability_details,
                    auth_details=auth_details
                )
                capability_result_flag = (
                    capability_response is not None and
                    capability_response.status_code == 200 and
                    'id' in capability_response.json()
                )
                if capability_result_flag:
                    capability_id = capability_response.json().get('id')
                else:
                    capability_id = None

                # Assert if Capability creation is successful
                assert capability_result_flag, (
                    f"Failed to create capability. Response: "
                    f"{capability_response.json() if capability_response else capability_response}"
                )

                test_api_obj.log_result(
                    capability_result_flag,
                    positive=(
                        f"Successfully created capability with details: "
                        f"{capability_response.json()}"
                    ),
                    negative=(
                    f"Failed to create capability with response: "
                    f"{capability_response.json() if capability_response else capability_response}"
                )

                )

                # Submit a Rating for the Capability and Attribute
                if capability_result_flag and attribute_result_flag:
                    # Select a random rating from the predefined list
                    rating_details = conf.rating_options

                    # Construct the URL with capability_id and attribute_id
                    assessment_response = test_api_obj.get_assessment_id(
                        capability_id=capability_id,
                        attribute_id=attribute_id,
                        rating_details=rating_details,
                        auth_details=auth_details
                    )

                    # Log result for rating submission
                    assessment_id_result_flag = (
                        assessment_response is not None and
                        assessment_response.status_code == 200
                    )
                    test_api_obj.log_result(
                        assessment_id_result_flag,
                        positive=(
                            f"Successfully retrieved the rating with details: "
                            f"{assessment_response.json()}"
                        ),
                        negative=(
                            f"Failed to retrieve the rating. Response: "
                            f"{assessment_response.json() if assessment_response else assessment_response}."
                        )
                    )

                    assessment_result_flag = (
                        assessment_response and assessment_response.status_code == 200
                    )

                    assessment_id = (
                        assessment_response.json().get('id')
                        if assessment_result_flag
                        else None
                    )


                    test_api_obj.log_result(
                        assessment_result_flag,
                        positive=f"Successfully retrieved assessment ID: {assessment_id}",
                        negative=(
                            f"Failed to retrieve assessment ID. Response: "
                            f"{assessment_response.json() if assessment_response else assessment_response}."
                        )
                    )

                    if assessment_result_flag:
                        rating_payload = {
                            'capability_assessment_id': assessment_id,
                            'rating': rating_details,
                            'comment': 'Retrieving rating details'
                        }

                        rating_response = test_api_obj.submit_ratings(
                            assessment_id=assessment_id,
                            rating_details=rating_payload,
                            auth_details=auth_details
                        )

                        rating_result_flag = rating_response and rating_response.status_code == 200
                        test_api_obj.log_result(
                            rating_result_flag,
                            positive=f"Successfully submitted rating with details: "
                                     f"{rating_response.json()}",
                            negative=(
                                f"Failed to submit rating with response: "
                                f"{rating_response.json() if rating_response else rating_response}."
                            )
                        )

            # Delete ACC model
            if acc_model_result_flag:
                delete_response = test_api_obj.delete_acc_model(
                    acc_model_id=acc_model_id,
                    auth_details=auth_details
                )
                delete_result_flag = (
                    delete_response is not None and
                    delete_response.status_code == 200)

                # Log result for ACC model deletion
                test_api_obj.log_result(
                    delete_result_flag,
                    positive=f"Successfully deleted ACC model with ID: {acc_model_id}",
                    negative=(
                        f"Failed to delete ACC model. Response: "
                        f"{delete_response.json() if delete_response else delete_response}."
                    )
                )

            # Delete attributes
            if attribute_result_flag:
                delete_response = test_api_obj.delete_attribute(
                    attribute_id=attribute_id,
                    auth_details=auth_details
                )
                delete_result_flag = (
                    delete_response is not None and
                    delete_response.status_code == 200)

                # Log result for Attribute deletion
                test_api_obj.log_result(
                    delete_result_flag,
                    positive=f"Successfully deleted attribute with ID: {attribute_id}",
                    negative=(
                        f"Failed to delete attribute. Response: "
                        f"{delete_response.json() if delete_response else delete_response}."
                    )
                )

        # Test for validation http error 401 when no authentication
        auth_details = None
        result = test_api_obj.check_validation_error(auth_details)
        test_api_obj.log_result(not result['result_flag'],
                            positive=result['msg'],
                            negative=result['msg'])

        # Test for validation http error 401 for invalid authentication
        # Set invalid authentication details
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
