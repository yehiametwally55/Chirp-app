# Chirp - A Full-Stack Cloud-Native Micro-Blogging App

Chirp is a complete, full-stack web application built from the ground up to practice and demonstrate hands-on experience with modern web technologies and a cloud-native architecture on Amazon Web Services (AWS). This project was developed as a practical exercise following the completion of the AWS Cloud Practitioner certification.

The application allows users to sign up, log in, post short messages ("Chirps"), and view a live timeline of all posts. The entire stack is containerized with Docker and deployed to AWS using Infrastructure as Code (IaC) with the AWS CDK.


## ## Key Features

* **Secure User Authentication:** Full sign-up and sign-in functionality managed by **Amazon Cognito**.
* **Real-time Timeline:** A central feed that displays all user posts in reverse chronological order.
* **Modern "Glassmorphism" UI:** A responsive, intuitive, and aesthetically pleasing user interface built with **Material-UI (MUI)**.
* **Containerized Environment:** Both frontend and backend applications are fully containerized using **Docker**, ensuring consistency between development and production.
* **Automated Cloud Deployment:** All AWS infrastructure is defined as code using the **AWS CDK**, allowing for repeatable and automated deployments.

---
## ## Technology Stack & AWS Services

This project utilizes a modern, robust technology stack chosen to reflect real-world application development and cloud best practices.

### ### Core Technologies

* **Frontend:** React, TypeScript, Material-UI (MUI)
* **Backend:** Node.js, Express.js, TypeScript
* **Database:** PostgreSQL
* **DevOps:** Docker, Docker Compose, GitHub

### ### AWS Services

The entire application is deployed on and powered by AWS:

* ☁️ **Compute:** **Amazon ECS with AWS Fargate** for running serverless containers.
* 📦 **Storage:** **Amazon S3** for static frontend hosting and **Amazon ECR** for storing Docker images.
* 🗃️ **Database:** **Amazon RDS** for a fully managed PostgreSQL database.
* 🌐 **Networking & Content Delivery:** **Amazon VPC**, **Application Load Balancer**, and **Amazon CloudFront**.
* 👤 **Security & Identity:** **Amazon Cognito** for user management and authentication, and **AWS IAM** for service permissions.
* 🏗️ **Infrastructure as Code:** **AWS CDK** and **AWS CloudFormation** to define and deploy all resources.

---
## ## Local Development Setup

To run this project on your local machine, you will need **Node.js**, **Docker Desktop**, and the **AWS CLI** installed and configured.

### ### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```

### ### 2. Backend & Database Setup

The backend server and PostgreSQL database are managed by Docker Compose.

```bash
# From the project root directory
docker-compose up --build
```
This command will build the backend Docker image and start both the backend and database containers. The API will be available at `http://localhost:8080`.

### ### 3. Frontend Setup

1.  Navigate to the client directory in a new terminal:
    ```bash
    cd client
    ```
2.  Install the necessary dependencies:
    ```bash
    npm install
    ```
3.  **Configure AWS Amplify:** Open `client/src/index.tsx` and add your Amazon Cognito User Pool details.
4.  Start the React development server:
    ```bash
    npm start
    ```
The application will be available at `http://localhost:3000`. The frontend is automatically configured to proxy API requests to the backend server.

---
## ## Deployment to AWS

The entire cloud infrastructure is defined in the `/infrastructure` directory using the AWS CDK.

1.  **Bootstrap CDK:** (One-time setup per region)
    ```bash
    cd infrastructure
    cdk bootstrap
    ```
2.  **Deploy the Stack:** This command will provision all the AWS resources defined in the stack (VPC, RDS, ECS, Cognito, etc.).
    ```bash
    cdk deploy
    ```
3.  **Deploy the Application Code:**
    * Push the backend Docker image to the created ECR repository.
    * Build the frontend (`npm run build`) and sync the `build` folder to the created S3 bucket.
