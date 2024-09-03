# ACC Model App

## Overview

The ACC Model App is a web application for managing and rating Attributes, Components, and Capabilities (ACC) for software projects. It provides a user-friendly interface for evaluating various capabilities against defined attributes and viewing aggregated ratings across users.

## Background

This project is built around the concept of ACC (Attributes, Components, Capabilities) modeling, originally introduced by Google. ACC modeling offers a streamlined approach to defining, testing, and assessing the essential elements of your project. This model replaces conventional test plans by providing a more dynamic, comprehensive, and easily maintainable framework. It helps you visualize the intersections between Attributes and Components, making it easier to identify gaps, prioritize testing efforts, and ensure that your project meets its intended quality standards.

ACC modeling is utilized to break down a software project into three key parts:

Attributes: The qualities or characteristics (adjectives) that describe the desired properties of your product, such as "Accuracy," "Responsiveness," or "User-Friendly."

Components: The major sections or building blocks (nouns) of your product, such as "User Management", "Shopping Cart" etc.

Capabilities: The specific features or functionalities (verbs) that each Component has such as "Add User", "Edit User" etc. 


## What Does This Application Do?
This application allows you to efficiently construct, manage, and assess an ACC model for your project. It enables you to:

- **Define Attributes:** Specify the adjectives that describe the core qualities of your product.
- **List Components:** Break down your project into its major sections or modules.
- **Map Capabilities:** Identify features of each Component
- **Rate Capabiltiies:** Evaluate and rate the effectivenss of each Capability.
- **View Ratings:** See a consolidated view of ratings for each Capability to better understand overall performance.

## Technologies Used
- **Frontend:** React, Material-UI
- **Backend:** FastAPI
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Tokens)

## Prerequisites
- **Node.js** (version 14.x or later)
- **Python** (version 3.8 or later)
- **FastAPI** and other Python dependencies
- **React** and other JavaScript dependencies


## Setup Instructions
To set up the project locally, follow these instructions:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>

2. Setup Backend and Frontend. Detailed instructions below.

### Backend (FastAPI)

1. Navigate to the backend directory:
    ```bash
    cd backend

2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate 

3. Install the required Python packages:
    ```bash
    pip install -r requirements.txt

4. Generate 'SECRET_KEY'.
   This is essential for cryptograhic signing within the application. To generate the key, run the following command in your terminal:

   ```bash
   openssl rand -hex 32
   ```

5. Set 'SECRET_KEY' as Environment Variable.
   * Create a '.env' file in the project root
   
   * Add the following line to '.env' replaceing 'your_secret_key_value_here' with the generated 'SECRET_KEY'"

   ```bash
   SECRET_KEY=your_secret_key_value_here
   ```
   * Ensure '.emv' is listed in your '.gitignore' file to prevent it from being committed to version control.

6. Run the backend server:
    ```bash
    uvicorn main:app --reload

The API will be available at `http://127.0.0.1:8000`. 

For a full list of avaiable endpoints, refer to the FastAPI auto-generated docs available at `http://127.0.0.1:8000/docs`.

### Frontend (React)

1. Navigate to the frontend directory:
    ```bash
    cd frontend

2. Install the required Node.js packages:
    ```bash
    npm install

3. Create a `.env` file with the following:
    ```bash
    REACT_APP_API_URL=http://127.0.0.1:8000

4. Run the React development server:
    ```bash
    npm start

The application will be available at `http://localhost:3000`.

## Usage
1. Access the application by navigating to `http://localhost:3000` in your web browser.

2. Register if a new user by using the Registration page.

3. Login with your credentials. (Note that there is no 'Forgot Password' option at the moment.)

4. If starting new, create ACC Model to begin with. Then divide your project into Components and then define the Capabilities. All these pages (ACC Models, Components, Capabilities, Attributes) are avaiable under the dropdown menu (present) on the Navigation bar.

5. To provide ratings for your capabilities, use the Ratings page. 


### License

This project is licensed under the MIT Licesnse. See the `LICENSE` for more details.

