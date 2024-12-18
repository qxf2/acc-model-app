## **Run API Tests**
   We are using the Qxf2 Page Object Model (POM) framework to run API tests for the ACC Model App. This framework helps in organizing and executing API test cases efficiently by providing a structured approach, reusable components, and easy integration with backend services for testing various API endpoints in the ACC Model App.
- **Run API Tests Locally**    
  Before running the tests, ensure you have the necessary environment setup, including the Bearer Token for authentication.

- **Run API Tests with Bearer Token**   
  For authentication, retrieve and export the Bearer Token as an environment variable by following the steps below:  
  1. **Launch the Backend Service**  
     Ensure the backend service is running. You can do this by running the application with Docker Compose:  
     `docker-compose up --build -d`  
     Confirm the backend is accessible by checking the logs or navigating to the appropriate URL (e.g., http://localhost:8000).  
  2. **Fetch the Bearer Token**  
     Use a tool like `curl` to authenticate with the backend and obtain the token. For example:  
     ```bash
     curl -X 'POST' \
     'http://localhost:8000/token' \
     -H 'accept: application/json' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     -d 'username=your_username&password=your_password'
     ```
  3. **Set the Token as an Environment Variable**  
     Use the token from the previous step and export it as an environment variable:  
     `export bearer_token="your_bearer_token"`

- **Install Test Dependencies**   
  Navigate to the tests folder and install dependencies using pip:
  `cd tests/pip install -r requirements.txt`

- **Run the Tests**   
  Run specific test files or all tests using pytest. For example, to run a specific test:
  `python -m pytest tests/test_name.py`
