# Email Cadence Monorepo

This project implements a dynamic email cadence system using Next.js, NestJS, and Temporal.io. It allows for mid-flight updates to running workflows, where a sequence of email and wait steps can be modified while a contact is already enrolled.

## Step-by-Step Guide to Run the App

Follow these steps in order to get the application running on your local machine:

### 1. Install Prerequisites
Make sure you have **Node.js (v18+)** installed. Then, install the **Temporal CLI**:
- **Windows**: Open PowerShell as Administrator and run:
  ```powershell
  winget install Temporal.TemporalCLI
  ```
- **macOS**: `brew install temporal`
- **Linux**: `curl -sSf https://temporal.download/cli.sh | sh`

*Important: Restart your terminal/IDE after installation.*

### 2. Install Project Dependencies
In the root of the project, run:
```bash
npm install
```

### 3. Verify Your Environment
Run the built-in check script to ensure everything is set up correctly:
```bash
npm run check-env
```
If you see "Environment is ready!", proceed to the next step.

### 4. Start the Temporal Server
Open a **new terminal window** and start the local Temporal development server:
```bash
temporal server start-dev
```
Keep this terminal running.

### 5. Start the Application
In your **original terminal window**, start all the apps (Web, API, and Worker) simultaneously:
```bash
npm run dev
```

### 6. Access and Use the App
1.  **Open the Web UI**: Go to [http://localhost:3000](http://localhost:3000) in your browser.
2.  **Save Cadence**: Click the "Save Cadence Definition" button to initialize the default cadence.
3.  **Enroll a Contact**: Enter an email and click "Start Workflow".
4.  **Monitor Live**: Watch the "Live Status" card update in real-time.
5.  **Test Dynamic Update**: Edit the JSON (e.g., change a `WAIT` time or add a step) and click "Push Updates to In-Flight" while the workflow is running. The workflow will adopt the new steps immediately!

---

## Application Workflow
1.  **Define Cadence**: Use the Web UI to define a sequence of steps (Email or Wait) in JSON format.
2.  **Save Definition**: Save the cadence to the API.
3.  **Enroll Contact**: Start a Temporal Workflow for a specific contact email.
4.  **Sequential Execution**:
    *   **SEND_EMAIL**: Executes a mock activity (logs to worker console).
    *   **WAIT**: Pauses the workflow for a specified duration (can be interrupted by updates).
5.  **Live Monitoring**: The UI polls the workflow state to show progress, current step, and version.
6.  **Mid-flight Updates**: Sending a signal (`updateCadence`) to a running workflow allows it to adopt a new step definition immediately.

---

## Troubleshooting

### 'temporal' is not recognized
If you see an error like `The term 'temporal' is not recognized`:
1.  **Install it**: Run the installation command for your OS (see Step 1).
2.  **Restart Terminal**: Close and reopen your terminal/IDE.
3.  **Verify**: Try running `temporal --version`.

### Ports already in use
If the API fails to start because port `3001` is busy, or Web fails on `3000`, ensure no other instances of the app are running. You can check for running node processes in Task Manager.

---

## Project Structure
- `apps/web`: Next.js frontend with Tailwind CSS.
- `apps/api`: NestJS API handling Temporal client operations.
- `apps/worker`: Temporal.io worker executing the business logic.
- `apps/shared`: Shared TypeScript types and constants.

---

## Temporal.io Configuration
The application uses the following Temporal.io configuration (placeholders in code):
- **Server Address**: `process.env.TEMPORAL_ADDRESS` (defaults to `localhost:7233`)
- **Namespace**: `default` (standard Temporal default)
- **Task Queue**: `email-cadence-task-queue` (defined in `apps/shared/src/index.ts`)

---

## API Usage Examples
(For manual testing with `curl`)

### Create/Update Cadence
```bash
curl -X POST http://localhost:3001/cadences \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cad_123",
    "name": "Welcome Flow",
    "steps": [
      { "id": "1", "type": "SEND_EMAIL", "subject": "Welcome", "body": "Hello" },
      { "id": "2", "type": "WAIT", "seconds": 10 }
    ]
  }'
```

### Enroll Contact
```bash
curl -X POST http://localhost:3001/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "cadenceId": "cad_123",
    "contactEmail": "user@example.com"
  }'
```

### Get Enrollment Status
```bash
curl http://localhost:3001/enrollments/enrollment-cad_123-user@example.com
```

### Update Running Workflow
```bash
curl -X POST http://localhost:3001/enrollments/enrollment-cad_123-user@example.com/update-cadence \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      { "id": "1", "type": "SEND_EMAIL", "subject": "Updated Welcome", "body": "Hello again" }
    ]
  }'
```
