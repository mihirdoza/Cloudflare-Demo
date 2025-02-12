# Cloudflare Worker with Hono

This project is a Cloudflare Worker using the [Hono] (https://hono.dev/) framework for building fast and lightweight APIs.

## Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [npm](https://www.npmjs.com/) 
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for managing Cloudflare Workers)

## Setup



1. Install dependencies:

   > npm install


2. Authenticate with Cloudflare (if not already authenticated):
   
   > npx wrangler login
   

## Running the Worker Locally

You can test the Cloudflare Worker locally using:

  > npm run dev


This runs the worker using Wrangler's development server.

## Deploying the Worker

To deploy your Cloudflare Worker, run:


> npm run deploy



## Configuring the Database

The current wrangler.toml file includes the following database configuration:

>  binding = "DB"
>  database_name = "demo"
>  database_id = "72a56221-9549-47d4-89e2-caa8d005798f"

1. To change the database configuration in Cloudflare:

2. Open your Cloudflare dashboard.

3. Navigate to Workers & Pages.

4. Select your worker and go to the Settings tab.

5. Under Bindings, locate DB and update the database_name or database_id as needed.

6. Save changes and redeploy your worker using:



## Project Structure

📂 worker/
├── 📄 wrangler.toml  # Cloudflare Worker configuration
├── 📄 package.json   # Project dependencies and scripts
├── 📂 src/
│   ├── 📄 index.js   # Main entry point for the Worker
│   ├── 📂 api/
│   │   ├── 📄 api.js # API-related logic functions
│   ├── 📂 common/
│   │   ├── 📄 common.js # Common utilities
└── 📄 README.md      # This documentation

## Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

Now you're ready to build and deploy your Cloudflare Worker with Hono! 🚀

