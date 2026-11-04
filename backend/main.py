from fastapi import FastAPI, UploadFile, File, HTTPException
from faster_whisper import WhisperModel
from pathlib import Path
import tempfile
import shutil
import os
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ollama import chat
import time
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Cue API",
    description="Local AI-powered desktop assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str



whisper_model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)


ALLOWED_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".m4a",
    ".aac",
    ".ogg",
    ".flac",
    ".webm",
    ".mp4",
}


@app.get("/")
def home():
    return {
        "message": "Cue backend is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/transcribe")
def transcribe_audio(file: UploadFile = File(...)):
    



    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was uploaded."
        )


    file_extension = Path(file.filename).suffix.lower()

  
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file format: {file_extension}. "
                f"Supported formats are: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        )

    temp_file_path = None

    try:


        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=file_extension
        ) as temp_file:

     
            shutil.copyfileobj(file.file, temp_file)

            temp_file_path = temp_file.name


 

        if os.path.getsize(temp_file_path) == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded audio file is empty."
            )



        start_time = time.perf_counter()

        segments, info = whisper_model.transcribe(
            temp_file_path,
            beam_size=1,

      
            vad_filter=True
        )



        transcription = " ".join(
            segment.text.strip()
            for segment in segments
        )

        transcription_time = time.perf_counter() - start_time
        print(
            f"Transcription time: {transcription_time:.2f} seconds"
        )


        return {
            "transcription": transcription,
            "language": info.language
        }




    except HTTPException:
        raise


    except Exception as error:

        
        print(f"Transcription error: {error}")

        
        raise HTTPException(
            status_code=500,
            detail="Failed to transcribe the audio file."
        )


   

    finally:

        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/suggest")
def suggest_answer(request: QuestionRequest):

    def generate():

        start_time = time.perf_counter()
        first_token_received = False

        try:
            stream = chat(
                model="qwen3:1.7b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are Cue, an AI assistant that helps answer "
                            "spoken questions. Give concise, direct, and useful "
                            "answers. Prioritize answering the question immediately. "
                            "Avoid unnecessary introductions and long explanations."
                        )
                    },
                    {
                        "role": "user",
                        "content": request.question
                    }
                ],
                stream=True,
                think=False
            )

            for chunk in stream:
                content = chunk["message"]["content"]

                if content:

                    
                    if not first_token_received:
                        first_token_received = True

                        time_to_first_token = (
                            time.perf_counter() - start_time
                        )

                        print(
                            f"Time to first token: "
                            f"{time_to_first_token:.2f} seconds"
                        )

                    yield content

        except Exception as error:

            print(f"Ollama suggestion error: {error}")

            yield (
                "\n\nUnable to generate an answer. "
                "Please make sure Ollama is running and the model is installed."
            )


    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )