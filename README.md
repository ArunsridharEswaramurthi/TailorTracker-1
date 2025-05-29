# Tailor's Client & Measurement Manager

## Description

This application is a web-based system designed for tailors or custom clothing businesses to efficiently manage their clients and detailed measurements for various types of garments. It provides a user-friendly interface for tracking client information, recording precise measurements, and organizing them by dress types.

## Key Features

*   **User Authentication:** Secure login for authorized users (tailors/staff).
*   **Client Management (CRUD):**
    *   Add, view, edit, and delete client profiles (contact information, personal details, notes).
*   **Measurement Management (CRUD):**
    *   Record, view, update, and delete sets of measurements for each client.
    *   Associate measurements with predefined "dress types" (e.g., "Formal Shirt," "Trousers").
    *   Flexible measurement fields (e.g., chest, waist, sleeve) stored as JSON, allowing different dress types to have unique measurement attributes.
    *   Store style preferences and notes for each measurement set.
*   **Dress Type Management:**
    *   View a list of available dress types.
    *   Create new dress types to categorize garments.
    *   The system initializes with a set of default dress types (Formal Shirt, Trousers, Suit Jacket, Traditional Wear).

## Tech Stack

*   **Frontend:**
    *   React (with TypeScript)
    *   Vite (build tool)
    *   Wouter (routing)
    *   TanStack Query (React Query) for data fetching
    *   Shadcn/ui (UI components)
    *   Tailwind CSS (styling)
*   **Backend:**
    *   Node.js
    *   Express.js (web framework, with TypeScript)
    *   Drizzle ORM (for PostgreSQL interaction)
    *   Passport.js (for local authentication)
    *   Zod (for schema validation)
*   **Database:**
    *   PostgreSQL (e.g., NeonDB, or local instance)
*   **Development:**
    *   `tsx` for running TypeScript directly
    *   `esbuild` for backend builds

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm (or yarn)
*   Access to a PostgreSQL database. (e.g., a local instance, Docker container, or a cloud-based one like Neon).
*   Git

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    *   Create a `.env` file in the root of the project by copying the `.env.example` file (if one exists, otherwise create it).
    *   Populate the `.env` file with your specific configurations:
        ```env
        # Example .env content (adjust as needed)
        DATABASE_URL="postgresql://user:password@host:port/database_name?sslmode=require" # Or your local DB connection string
        SESSION_SECRET="your_very_secret_session_key_here"

        # For development with Vite (usually defaults are fine)
        # HOST="0.0.0.0"
        # PORT=5173 # Default Vite port, but app runs on 5000
        ```
    *   **Note:** The application server is configured to run on port 5000 (`server/index.ts`).

4.  **Database Setup:**
    *   Ensure your PostgreSQL server is running and accessible.
    *   Apply the database schema:
        ```bash
        npm run db:push
        ```
        This command uses Drizzle Kit to push the schema defined in `shared/schema.ts` to your database.

## Running the Application

1.  **Development Mode:**
    *   This command starts the backend server with `tsx` and the Vite development server for the frontend with hot reloading.
    ```bash
    npm run dev
    ```
    *   The application will be accessible at `http://localhost:5000` (as the server proxies Vite requests in dev).

2.  **Building for Production:**
    ```bash
    npm run build
    ```
    *   This command builds the frontend client (into `dist/client`) and the backend server (into `dist`).

3.  **Running in Production:**
    ```bash
    npm run start
    ```
    *   This command starts the Node.js server using the production build.
    *   The application will be accessible at `http://localhost:5000`.

## API Endpoints

The backend exposes RESTful APIs under the `/api` prefix. Key authenticated endpoints include:

*   **Auth:**
    *   `POST /auth/register`
    *   `POST /auth/login`
    *   `POST /auth/logout`
    *   `GET /auth/me`
*   **Clients:**
    *   `GET /api/clients`
    *   `POST /api/clients`
    *   `GET /api/clients/:id` (includes measurements)
    *   `PUT /api/clients/:id`
    *   `DELETE /api/clients/:id`
*   **Dress Types:**
    *   `GET /api/dress-types`
    *   `POST /api/dress-types`
*   **Measurements:**
    *   `GET /api/clients/:clientId/measurements`
    *   `POST /api/measurements`
    *   `PUT /api/measurements/:id`
    *   `DELETE /api/measurements/:id`

## Project Structure (Simplified)

```
/
├── client/         # React frontend application (Vite)
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions, query client
│   │   ├── pages/      # Page components (Dashboard, Client Profile, Auth)
│   │   ├── App.tsx     # Main app component with routing
│   │   └── main.tsx    # Client entry point
│   └── index.html
├── server/         # Express backend server
│   ├── index.ts    # Server entry point
│   ├── auth.ts     # Authentication setup
│   ├── db.ts       # Database connection (Drizzle)
│   ├── routes.ts   # API route definitions
│   └── storage.ts  # Data access logic
├── shared/         # Code shared between client and server
│   └── schema.ts   # Database table schemas and Zod validation schemas
├── .env.example    # Example environment variables (you'll need to create a .env)
├── drizzle.config.ts # Drizzle ORM configuration
├── package.json
└── README.md       # This file
```
