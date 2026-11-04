"use client";

import { useRef, useState } from "react";

export default function Home() {

  const [isRecording, setIsRecording] = useState(false);


  const [status, setStatus] = useState("Waiting for audio");


  const [transcript, setTranscript] = useState("");


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);


  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
  
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });


      const mediaRecorder = new MediaRecorder(stream);


      mediaRecorderRef.current = mediaRecorder;

 
      audioChunksRef.current = [];


      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };


      mediaRecorder.onstop = async () => {
      
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        console.log("Recording complete:", audioBlob);

        try {
          setStatus("Transcribing...");

   
          const formData = new FormData();


          formData.append("file", audioBlob, "recording.webm");

 
          const response = await fetch(
            "http://127.0.0.1:8000/transcribe",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const data = await response.json();

          console.log("Transcript:", data);

          setTranscript(data.transcription);

          setStatus("Transcription complete");
        } catch (error) {
          console.error("Transcription error:", error);

          setStatus("Transcription failed");
        } finally {
          setIsRecording(false);
        }
      };

      mediaRecorder.start();

      setIsRecording(true);
      setStatus("Recording...");
    } catch (error) {
      console.error("Microphone error:", error);
      setStatus("Unable to access microphone");
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;


    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      return;
    }


    mediaRecorder.stop();

    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">

        <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              CUE
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Local AI Desktop Assistant
            </p>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12">

          <div className="mb-10 flex flex-col items-center">
            <div className="mb-6 text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
                Voice Input
              </p>

              <h2 className="mt-3 text-3xl font-semibold">
                Ask your question
              </h2>

              <p className="mt-3 text-zinc-400">
                Start recording and speak naturally.
              </p>
            </div>

            <div className="flex gap-4">

              <button
                onClick={startRecording}
                disabled={isRecording}
                className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRecording ? "Recording..." : "Start Recording"}
              </button>

             
              <button
                onClick={stopRecording}
                disabled={!isRecording}
                className="rounded-xl border border-zinc-700 px-6 py-3 font-medium transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Stop
              </button>

            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Transcription
              </h3>

              <span className="text-xs text-zinc-500">
                {status}
              </span>
            </div>

            <p className="min-h-16 text-lg text-zinc-300">
              {transcript || "Your spoken question will appear here..."}
            </p>
          </div>


          <button className="mb-6 w-full rounded-xl bg-zinc-100 py-4 font-semibold text-black transition hover:bg-white">
            Suggest Answer
          </button>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">✦</span>

              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Cue Answer
              </h3>
            </div>

            <p className="min-h-24 leading-7 text-zinc-300">
              Your AI-generated answer will appear here...
            </p>
          </div>

        </section>

        <footer className="border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">
          Powered locally by Faster Whisper and Ollama
        </footer>

      </div>
    </main>
  );
}