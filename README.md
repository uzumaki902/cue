# CUE

A local AI-powered desktop assistant inspired by Parakeet AI.

CUE captures microphone audio, transcribes speech locally, and generates AI-powered answers progressively in real time.

## Features

- Desktop application built with Electron
- Start and stop microphone recording
- Local speech-to-text using Faster Whisper
- Displays transcription in the app
- Editable transcription before generating an answer
- AI-generated answer streaming progressively
- Local LLM inference using Ollama and Qwen3
- Performance timing for transcription and AI time-to-first-token

## Tech Stack

### Desktop & Frontend
- Electron
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend & AI
- FastAPI
- Faster Whisper
- Ollama
- Qwen3 1.7B

## Architecture

```text
Electron Desktop Window
        ↓
Next.js + React Frontend
        ↓
FastAPI Backend
       ↙        ↘
Faster Whisper   Ollama + Qwen3
```

All AI processing runs locally on the machine.

## How It Works

1. Click **Start Recording**.
2. Speak into the microphone.
3. Click **Stop**.
4. Audio is sent to the local FastAPI backend.
5. Faster Whisper transcribes the audio locally.
6. The transcription appears in the application.
7. Click **Suggest Answer**.
8. Ollama generates an answer locally.
9. The answer streams progressively into the application.

## Setup

### 1. Install Ollama

Install Ollama and download the required model:

```bash
ollama pull qwen3:1.7b
```

### 2. Start the Backend

```bash
cd backend
```

Create and activate a virtual environment, install dependencies, then run:

```bash
uvicorn main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

### 3. Start the Desktop Application

```bash
cd frontend
npm install
npm run dev
```

Then start Electron:

```bash
npm run electron
```

## Performance Testing

The backend logs:

- Whisper transcription time
- AI time-to-first-token

This helps measure the responsiveness of the local AI pipeline.

## Local Processing

CUE is designed so that:

- Speech-to-text runs locally using Faster Whisper
- AI generation runs locally using Ollama
- No cloud AI API is required for transcription or answer generation

## Project Structure

```text
cue/
├── backend/
│   ├── main.py
│   └── requirements.txt
│
└── frontend/
    ├── app/
    ├── electron.mjs
    ├── package.json
    └── ...
```

## Assignment Requirements Covered

- Desktop application
- Start and Stop controls
- Microphone audio capture
- Speech transcription display
- Suggest Answer functionality
- Progressive AI answer streaming
- Local speech-to-text
- Local LLM inference

## Demo

CUE runs as a local Electron desktop application.
