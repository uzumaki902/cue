# Cue

A local AI-powered desktop assistant inspired by Parakeet AI.

Cue captures microphone audio, transcribes spoken questions locally using Faster Whisper, and generates AI answers locally using Ollama.

## Features

- Desktop application built with Electron
- Start and stop microphone recording
- Local speech-to-text transcription using Faster Whisper
- Editable transcription
- AI-generated answer suggestions using Ollama
- Progressive/streaming AI responses
- Local AI processing

## Tech Stack

### Frontend / Desktop

- Next.js
- React
- TypeScript
- Tailwind CSS
- Electron

### Backend

- FastAPI
- Faster Whisper
- Ollama
- Qwen3 1.7B

## Prerequisites

Install the following before running the project:

- Node.js
- Python
- Ollama

Install the Ollama model:

```bash
ollama pull qwen3:1.7b
```

## Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

## Backend Setup

Navigate to the backend directory and create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install fastapi uvicorn faster-whisper python-multipart ollama
```

Start the FastAPI backend:

```bash
uvicorn main:app --reload
```

The backend should run on:

```text
http://127.0.0.1:8000
```

## Running the Desktop Application

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Start the Cue desktop application:

```bash
npm run electron
```

This opens Cue in an Electron desktop window.

## How to Use

1. Start the FastAPI backend.
2. Ensure Ollama is installed and the model is available.
3. Run `npm run electron`.
4. Click **Start Recording**.
5. Speak your question.
6. Click **Stop**.
7. Wait for the local transcription.
8. Edit the transcription if necessary.
9. Click **Suggest Answer**.
10. Watch the AI response appear progressively.

## Local AI Architecture

```text
Microphone
    ↓
Electron + Next.js Desktop UI
    ↓
FastAPI
    ↓
Faster Whisper
    ↓
Transcription
    ↓
Ollama (Qwen3)
    ↓
Streaming AI Answer
```

## Performance Testing

Cue includes basic local AI performance monitoring:

- Transcription processing time
- AI time-to-first-token

These timings are logged by the backend during testing.

## Notes

The speech-to-text and LLM processing run locally.

The current desktop prototype requires the FastAPI backend and Ollama to be running locally before launching the Electron application.

## Build

To build the Next.js frontend:

```bash
npm run build
```

To launch the Electron desktop application:

```bash
npm run electron
```
