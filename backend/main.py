from fastapi import FastAPI, UploadFile, File, HTTPException
from faster_whisper import WhisperModel
from pathlib import Path
import tempfile
import shutil

app = FastAPI(
    title="Cue API",
    description="Local AI-powered desktop assistant",
    version="1.0.0"
)


print("Loading Faster Whisper model...")

whisper_model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)

print("Faster Whisper model loaded successfully!")


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
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Receives an audio file and converts speech into text.
    """

  
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No audio file provided"
        )


    suffix = Path(file.filename).suffix

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        shutil.copyfileobj(file.file, temp_file)

        temp_file_path = temp_file.name

    try:
      
        segments, info = whisper_model.transcribe(
            temp_file_path,
            beam_size=1
        )

        
        transcription = " ".join(
            segment.text.strip()
            for segment in segments
        )

        return {
            "transcription": transcription,
            "language": info.language
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
      
        Path(temp_file_path).unlink(missing_ok=True)