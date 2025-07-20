# Frontend (React + Vite) - SAM2 Mask Generator

This is the frontend for the SAM2 Mask Generation application with Modal integration.

## Tech Stack
- React
- Vite
- Yarn

## Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the development server:
   ```bash
   yarn dev
   ```
3. The app will run at `http://localhost:5173` by default.

## Features (to implement)
- Image upload with preview
- Generate masks (calls backend)
- Interactive mask overlay (click to fetch mask for a point)
- Toggle mask visibility

## Configuration
- Backend API base URL: `http://localhost:8000` (default)
- Set custom backend URL in `.env` file:
  ```
  VITE_API_BASE_URL=http://your-backend-url
  ```

## Integration
- Connects to FastAPI backend
- Backend uses Modal for GPU-powered SAM2 inference
- Real-time mask generation and display
