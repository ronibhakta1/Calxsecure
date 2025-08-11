# Calxsecure: End-to-End Payment Web Application

**[View Live Demo »](https://calxsecure.ronibhakta.in/)**

[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/ronibhakta/calxsecure)
[![Stars](https://img.shields.io/github/stars/ronibhakta/calxsecure.svg)](https://github.com/ronibhakta/calxsecure/stargazers)
[![Forks](https://img.shields.io/github/forks/ronibhakta/calxsecure.svg)](https://github.com/ronibhakta/calxsecure/network/members)

A secure, full-stack web application designed to simulate an end-to-end payment and wallet system. Built with a focus on security, performance, and a clean user experience.

The application is deployed and publicly accessible. You can test its features by visiting the link below:

### **[https://calxsecure.ronibhakta.in/](https://calxsecure.ronibhakta.in/)**

## ✨ About The Project

Calxsecure is a comprehensive payment web application that demonstrates a complete, secure transaction flow. From user authentication to wallet management and peer-to-peer transfers, it provides a realistic simulation of a modern digital payment platform.

The core of this project lies in ensuring the integrity and security of transactions. We've implemented secure authentication using JWT, data validation with Zod, and database transactions to maintain data consistency, mimicking the robust processes of real-world financial applications.

### 🚀 Key Features

* **Secure User Authentication**: Safe and secure signup and sign-in functionality using JSON Web Tokens (JWT).
* **Digital Wallet**: Each user gets a wallet with a balance upon registration.
* **Peer-to-Peer Transfers**: Instantly send money to other users on the platform.
* **Transaction History**: View a detailed, real-time log of all your past transactions.
* **Atomic Database Operations**: MongoDB transactions are used to ensure that money transfers are atomic (i.e., they either complete fully or not at all), preventing data inconsistency ($A \in \mathbb{Z}$).
* **Input Sanitization & Validation**: Robust backend validation using Zod to prevent malicious data entry.
* **Responsive UI**: A clean and intuitive user interface built with React and Tailwind CSS.

### 🛠️ Tech Stack

This project is built using the MERN stack and other modern technologies:

* **Frontend**: React, React Router, Tailwind CSS, Axios
* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose
* **Authentication**: JSON Web Tokens (JWT), bcrypt
* **Data Validation**: Zod

## 🏁 Getting Started (For Local Development)

If you wish to run the project on your local machine, follow these instructions.

### Prerequisites

Make sure you have the following installed on your system:

* [Node.js](https://nodejs.org/en/) (v14 or higher)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/ronibhakta/calxsecure.git](https://github.com/ronibhakta/calxsecure.git)
    cd calxsecure
    ```

2.  **Install Backend Dependencies:**
    ```sh
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```

4.  **Set up Environment Variables:**
    Create a `.env` file in the `backend` directory and add the following variables. Use the `.env.example` file as a template.
    ```env
    # backend/.env

    # MongoDB Connection String
    MONGO_DB_URL="your_mongodb_connection_string"

    # Port for the server to run on
    PORT=3000

    # JWT Secret Key for signing tokens
    JWT_SECRET="your_strong_jwt_secret"
    ```

### Usage

1.  **Start the Backend Server:**
    From the `backend` directory:
    ```sh
    npm start
    ```
    The server will start on `http://localhost:3000` (or the port you specified).

2.  **Start the Frontend Development Server:**
    From the `frontend` directory:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 📸 Screenshots

*(Replace these placeholder images with actual screenshots from your live application.)*

| Login Page                                     | Dashboard                                        | Transfer Page                                  |
| ---------------------------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| ![Login Page](https://i.imgur.com/your-login.png) | ![Dashboard](https://i.imgur.com/your-dashboard.png) | ![Transfer](https://i.imgur.com/your-transfer.png) |

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

To contribute:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please make sure to update tests as appropriate.

## 📜 License

Distributed under the BSD 3-Clause License. See `LICENSE` for more information.

## 📬 Contact

Roni Bhakta - [@ronibhakta1](https://twitter.com/ronibhakta1) - ronibhakta1@gmail.com

Project Link: [https://github.com/ronibhakta/calxsecure](https://github.com/ronibhakta/calxsecure)

