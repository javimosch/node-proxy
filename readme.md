# Node Proxy Application

This application provides a UI for managing reverse proxy configurations and a dynamic proxy backend to route requests based on these configurations.

## Project Description

The Node Proxy application consists of two main parts:

*   **Frontend (UI):** A React-based user interface for managing proxy configurations. Users can add, edit, and delete proxy configurations through this UI.
*   **Backend (Proxy Server):** A Node.js/Express backend that dynamically proxies requests to different backend services based on configurations stored in a database.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd node-proxy
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    cd frontend
    npm install
    cd ..
    ```

3.  **Configure environment variables:**

    *   Create a `.env` file in the root directory.
    *   Add necessary environment variables, such as database connection details and API keys (if any). Refer to `.env-example` for required variables.

4.  **Database setup:**

    *   Ensure MongoDB is running and accessible.
    *   Optionally, run `scripts/populate-db.js` to populate the database with initial proxy configurations.

## Running the Application

1.  **Start the backend server:**

    ```bash
    npm start
    ```

    This will start the backend server on port 3000 (default).

2.  **Start the frontend development server (for development):**

    ```bash
    cd frontend
    npm start
    cd ..
    ```

    This will start the frontend development server on port 3001 (default). Open your browser and navigate to `http://localhost:3001`.

3.  **Build and run frontend for production:**

    ```bash
    cd frontend
    npm run build
    cd ..
    npm run start:prod
    ```

    This will build the frontend and serve it along with the backend from the backend server. Open your browser and navigate to `http://localhost:3000`.

## Configuration

Proxy configurations are stored in a MongoDB database. You can manage these configurations through the UI accessible at `http://localhost:3001` (in development) or `http://localhost:3000` (in production).

The configuration includes:

*   **Name:** A descriptive name for the proxy configuration.
*   **Domain:** The domain or hostname that will be proxied.
*   **Proxy To:** The target backend service URL to proxy requests to.

For more details, refer to the documentation and codebase.