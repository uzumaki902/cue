
from pathlib import Path
from faster_whisper import WhisperModel

BASE_DIR = Path(__file__).resolve().parent
AUDIO_FILE = BASE_DIR / "sample.wav"

print("Audio file location:", AUDIO_FILE)
print("Audio file exists:", AUDIO_FILE.exists())

if not AUDIO_FILE.exists():
    raise FileNotFoundError(f"Audio not found: {AUDIO_FILE}")

print("Loading Faster Whisper model...")

model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)

print("Model loaded successfully!")

segments, info = model.transcribe(
    str(AUDIO_FILE),
    beam_size=1
)

print("Detected language:", info.language)
print("\nTranscription:")

for segment in segments:
    print(segment.text)
