# Lab Sync Collaborate

## Project Overview

Lab Sync Collaborate is a collaborative platform for virtual laboratory experiments. It allows students and educators to work together in real-time on various scientific experiments in a virtual environment.

## Features

- Real-time collaboration with multiple users
- Live code editing with cursor tracking
- Pre-configured virtual lab experiments
- Easy-to-use interface for joining or creating experiment rooms
- Support for various scientific disciplines including chemistry, physics, and biology

## Getting Started

To run this project locally, follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_REPOSITORY_URL>

# Step 2: Navigate to the frontend directory
cd Lab-Sync-Collaborate/frontend

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Socket.IO for real-time collaboration
- Monaco Editor for code editing

## Deployment

To build the project for production:

```sh
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Backend

The backend server should be running at http://localhost:5000. Make sure it's properly set up and running before using the frontend application.

## Project Structure

- `src/components`: UI components
- `src/pages`: Application pages
- `src/lib`: Utility functions and hooks
- `src/data`: Static data files
