# Project: Node Proxy with UI Editor

**Goal:** Create a Node.js/Express application that acts as a reverse proxy, with a React-based UI editor for managing the proxy configurations. Configurations will be stored in MongoDB.

## 1. Project Structure:

```
node-proxy/
├── frontend/         (React application)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── components/
│       │    ├── ConfigTable.js  (Displays configurations)
│       │    ├── AddConfigForm.js (Form to add)
│       │    └── EditConfigForm.js (Form to edit)
│       ├── index.js
│       └── index.css
├── index.js          (Express server)
├── .env-example      (Example environment variables)
├── package.json
├── package-lock.json
└── docs/
    └── ui.md         (This plan)
```

## 2. Frontend (React UI):

*   **Technology:** React
*   **Components:**
    *   `App.js`: Main component, handles fetching initial data and rendering other components.
    *   `ConfigTable.js`: Displays the current configurations in a table. Includes edit/delete buttons for each entry.
    *   `AddConfigForm.js`: Form for adding new configurations.
    *   `EditConfigForm.js`: Form for editing existing configurations.
*   **Styling:** Basic CSS (`index.css`).
*   **Communication:** Uses the Fetch API to communicate with the backend via a single RPC endpoint: `POST /api/rpc`.
*   **RPC Request Format:**

    ```json
    {
      "action": "getConfig" | "addConfig" | "updateConfig" | "deleteConfig",
      "id": "...", // (For updateConfig and deleteConfig)
      "data": { ... } // (For addConfig and updateConfig - configuration data)
    }
    ```

*   **Error Handling:** Displays simple success/failure notifications.

## 3. Backend (Express Server):

*   **Dependencies:** `express`, `http-proxy-middleware`, `mongoose`, `dotenv`
*   **MongoDB Connection:**
    *   Uses `mongoose` to connect to MongoDB.
    *   Connection string is read from the `.env` file (using `dotenv`).
    *   `.env-example` file will be provided.
    *   Schema:
        ```javascript
        {
          name: String,
          domain: String,
          proxyTo: String,
        }
        ```
*   **API Endpoint:**
    *   `POST /api/rpc`: Handles all UI actions.
    *   Uses a `switch` statement to handle different `action` values:
        *   `getConfig`: Fetches all configurations from MongoDB.
        *   `addConfig`: Adds a new configuration to MongoDB (backend generates ID).
        *   `updateConfig`: Updates an existing configuration in MongoDB.
        *   `deleteConfig`: Deletes a configuration from MongoDB.
        *   `reloadConfig`: Reloads config on the backend
*   **Initial Data:** Reads the initial configuration from MongoDB on startup.
*   **No Authentication:** The API is not protected by authentication.

## 4. Steps:

1.  **Backend Setup:**
    *   Install dependencies: `npm install express http-proxy-middleware mongoose dotenv -y`
    *   Create `.env-example`.
    *   Implement MongoDB connection logic in `index.js`.
    *   Create the Mongoose schema and model.
    *   Implement the `POST /api/rpc` endpoint with handlers for each action.
    *   Modify the existing proxy logic to use data from MongoDB.

2.  **Frontend Setup:**
    *   Create the `frontend` directory.
    *   Use `npx create-react-app frontend` to bootstrap the React application.
    *   Implement the React components (`App.js`, `ConfigTable.js`, `AddConfigForm.js`, `EditConfigForm.js`).
    *   Implement the communication logic with the backend using the Fetch API.
    *   Add basic styling.

3.  **Integration:**
    *   Ensure the frontend and backend are communicating correctly.
    *   Test all UI functionalities (add, edit, delete, reload).

## 5. Detailed Plan:

**Phase 1: Backend Modifications (index.js)**

1.  **Install Dependencies:** Install `mongoose` and `dotenv`:
    ```bash
    npm install mongoose dotenv
    ```
2.  **Create .env-example:** Create a `.env-example` file with the following content:
    ```
    MONGODB_URI=mongodb://localhost:27017/node_proxy
    ```
3.  **Modify index.js:**
    *   Import `mongoose` and `dotenv`.
    *   Load environment variables using `dotenv`.
    *   Connect to MongoDB using the connection string from `.env`.
    *   Create a Mongoose schema and model for the proxy configurations, as defined in `ui.md`:

        ```javascript
        {
          name: String,
          domain: String,
          proxyTo: String,
        }
        ```
    *   Implement the `POST /api/rpc` endpoint:
        *   Use `express.json()` middleware to parse JSON request bodies.
        *   Use a `switch` statement to handle the different `action` values (`getConfig`, `addConfig`, `updateConfig`, `deleteConfig`).
        *   For each action, interact with the MongoDB database using the Mongoose model.
        *   Return appropriate JSON responses (success/failure).
    *   Modify the `dynamicProxy` middleware:
        *   Fetch configurations from MongoDB instead of `config.json`.
        *   Remove the `fs.watchFile` logic and the `reloadConfig` function, as config reloading will be handled by the UI and database.
    * Add debug logs as per global instructions.

**Phase 2: Frontend Setup (frontend directory)**

1.  **Create React App:** Bootstrap the React application:
    ```bash
    npx create-react-app frontend
    ```
2.  **Navigate to frontend:**
    ```bash
    cd frontend
    ```
3. **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Implement Components:** Create the following React components inside `frontend/src/components`:
    *   `ConfigTable.js`: Displays configurations in a table with edit/delete buttons.
    *   `AddConfigForm.js`: Form for adding new configurations.
    *   `EditConfigForm.js`: Form for editing existing configurations.
5.  **Implement App.js:**
    *   Fetch initial data from `/api/rpc` (`getConfig`).
    *   Manage state for configurations.
    *   Render `ConfigTable`, `AddConfigForm`, and `EditConfigForm`.
    *   Implement functions to handle add, edit, and delete actions, sending requests to `/api/rpc`.
6.  **Implement Communication:** Use the Fetch API in `App.js` and the form components to communicate with the backend (`/api/rpc`).
7.  **Basic Styling:** Add basic styling to `frontend/src/index.css`.
8.  **Key prop:** Ensure the `key` prop is used when rendering lists in React.
9. Add debug logs as per global instructions.

**Phase 3: Database Population Script (scripts/populate-db.js)**

1.  **Create Directory:** Create a `scripts` directory in the project root.
2.  **Create populate-db.js:** Create a `populate-db.js` file inside the `scripts` directory.
3.  **Implement Script:**
    *   Import `mongoose`, `dotenv` and the Mongoose model from `index.js`.
    *   Load environment variables.
    *   Connect to MongoDB.
    *   Read the `config.json` file.
    *   Iterate through the configurations in `config.json`.
    *   For each configuration, create a new document in the MongoDB collection using the Mongoose model.
    *   Disconnect from MongoDB after populating.
    * Use ES module syntax (import/export) since the project uses "type": "module" in package.json.
4. Add debug logs as per global instructions.

**Phase 4: Integration and Testing**

1.  **Run Backend:** Start the Express server (`node index.js`).
2.  **Run Frontend:** Start the React development server (`cd frontend && npm start`).
3.  **Run Population Script:** Execute the population script (`node scripts/populate-db.js`).
4.  **Test:** Thoroughly test all UI functionalities (add, edit, delete). Verify data persistence in MongoDB.

**Phase 5: npm scripts and serving static files**
1. **Install dev dependencies:**
    ```
    npm install --save-dev nodemon concurrently
    ```
2. **Update package.json:**
   Add the following scripts to the `scripts` section in `package.json`:
    ```json
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "dev": "concurrently \"nodemon index.js\" \"cd frontend && npm start\"",
        "build": "cd frontend && npm run build",
        "start": "node index.js"
    },
    ```
3. **Modify index.js:**
    *   Add middleware to serve static files from the `frontend/build` directory. This should be done *after* the `/api/rpc` route, so that API requests are handled correctly, and *before* the `dynamicProxy` middleware.
     ```javascript
      // Serve static files from React app (in production)
      app.use(express.static(path.join(__dirname, 'frontend/build')));

      // Proxy /api/rpc to the backend in development mode
      if (process.env.NODE_ENV === 'development') {
          app.use('/api/rpc', createProxyMiddleware({ target: 'http://localhost:3005', changeOrigin: true }));
      }
    ```
    * Import `path` at the top of the file.
    ```javascript
    import path from 'path';
    import { fileURLToPath } from 'url';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    ```

**Mermaid Diagram (Project Structure):**

```mermaid
graph LR
    subgraph Frontend [frontend]
        A[App.js] --> B(ConfigTable.js)
        A --> C(AddConfigForm.js)
        A --> D(EditConfigForm.js)
        B -->|Edit| D
        B -->|Delete| A
        C -->|Add| A
        style A fill:#f9f,stroke:#333,stroke-width:2px
    end
    subgraph Backend [index.js]
        E[Express Server] --> F(MongoDB)
        E -->|/api/rpc| G{Mongoose Model}
        G --> F
        style E fill:#ccf,stroke:#333,stroke-width:2px
    end
     subgraph scripts
        H[populate-db.js] --> F
     end
    A <--> E
