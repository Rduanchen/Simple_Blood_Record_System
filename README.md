# Blood Pressure Record System - Backend

A comprehensive Node.js backend system for tracking and managing blood pressure records with multi-user support, notifications, and data sharing capabilities.

## Features

- User authentication using Firebase Auth
- CRUD operations for blood pressure records
- Date-range based filtering of records
- CSV import/export functionality
- Safety monitoring with customizable thresholds
- Share data with other users via share codes
- Push notifications using Firebase Cloud Messaging
- Multi-user support with permission management

## Tech Stack

- Node.js with Express
- TypeScript
- PostgreSQL with Sequelize ORM
- Firebase Authentication
- Firebase Cloud Messaging
- JWT for API authentication
- Jest for testing
- Swagger for API documentation

## Prerequisites

- Node.js (v14+)
- PostgreSQL database
- Firebase project with Authentication and Cloud Messaging enabled

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blood-pressure-record-system.git
cd blood-pressure-record-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration (database, Firebase, etc.)

5. Build the project:
```bash
npm run build
```

## Running the Server

Development mode with hot reloading:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Documentation

API documentation is available through Swagger UI at:
```
http://localhost:3000/api-docs
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
/src
  /config             - Configuration files (db, firebase, jwt)
  /models             - Database models
  /services           - Business logic
  /controllers        - API controllers
  /routes             - API routes
  /middleware         - Authentication & validation
  /utils              - Utility functions
  /types              - TypeScript type definitions
  /tests              - Test files
  app.ts              - Express application setup
  server.ts           - Server entry point
```

## License

MIT