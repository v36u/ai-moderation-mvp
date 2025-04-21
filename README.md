## Running the application

1. Make sure you have the required dependencies:
   1. If using Windows, the project must be executed using WSL
      1. Also, in the root of the project, you will have to execute these commands:
         1. `python3 -m venv .venv`
         2. `source .venv/bin/activate`
   2. Python
   3. NodeJS
   4. Bun
2. If you've just cloned the repo, you can run this command at the root of the project: `bun run deps`
   1. It will install the dependencies for both the API and the frontend
3. Run this command at the root of the project: `bun run dev`
   1. It wil start up both the API and the frontend
