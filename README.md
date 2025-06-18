# 🧠 Bitespeed Contact Identification

A TypeScript-based service to identify and consolidate customer identities across multiple purchases on **FluxKart.com**, where users may use different emails and phone numbers. This service ensures a consistent and personalized shopping experience by intelligently linking related contact records.

## 🧰 Tech Stack

- **TypeScript**
- **Node.js**
- **Express**
- **MySQL**
- **REST API**

---

## 🧑‍🚀 Problem Statement

Doc Brown, like many other users, uses different combinations of contact info (email, phone number) for each purchase. Our goal is to detect and link all these records as one single identity, preserving the oldest as the **primary contact** and linking others as **secondary**.

---

## 📦 Features

- 🔗 Link related contacts by email or phone
- 🎯 Identify primary vs secondary contacts
- 🧹 Deduplicate contact records
- 🗄️ Store and retrieve contact chains with accurate relationships

---

## 📁 Project Structure

├── src<br>
│ ├── bo # Business logic layer<br>
│ ├── controller # API controller logic
│ ├── dao # Data access logic (SQL queries)
│ ├── models # TypeScript interfaces and DB models
│ ├── routes # Express routes
│ └── server.ts # Entry point
├── .env # Environment variables
├── tsconfig.json # TypeScript configuration
├── package.json
└── README.md




---

## 🚀 Getting Started

### 1. Clone the repo
git clone https://github.com/your-username/bitespeed-contact-identification.git
cd bitespeed-contact-identification

### 2. Install dependencies
npm install

### 3. Configure environment
Create a .env file in the root with:<br>
DB_HOST=localhost<br>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=contacts
PORT=8085

### 4. Run the project
npm start


📬 API Endpoint
### POST api/identify

### Request
{
  "email": "docbrown@fluxkart.com",
  "phoneNumber": "1234567890"
}




