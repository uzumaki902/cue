"use client";

import { useEffect, useRef, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);


  const [status, setStatus] = useState("Waiting for audio");


  const [transcript, setTranscript] = useState("");

  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);


  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream
        .getTracks()
        .forEach((track) => track.stop());
    };
  }, []);

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
   
          const formData = new FormData();


          formData.append("file", audioBlob, "recording.webm");

 
          const response = await fetch(
            `${API_URL}/transcribe`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();

            console.error("Transcription API error:", errorText);

            throw new Error("Transcription failed");
          }

          const data = await response.json();

          console.log("Transcript:", data);

          const text = (data.transcription ?? "").trim();

          setTranscript(text);

          setStatus(
            text
              ? "Transcription complete"
              : "No speech detected, try again"
          );
        } catch (error) {
          console.error("Transcription error:", error);

          setStatus("Transcription failed");
        } finally {
          setIsTranscribing(false);
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

    setIsRecording(false);
    setIsTranscribing(true);
    setStatus("Transcribing...");
  };

  const suggestAnswer = async () => {
    if (
      !transcript.trim() ||
      isRecording ||
      isTranscribing ||
      isGenerating
    ) {
      return;
    }

    try {
      setIsGenerating(true);
      setAnswer("");

      const response = await fetch(
        `${API_URL}/suggest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: transcript,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Suggestion API error:", errorText);

        throw new Error("Failed to generate answer");
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Unable to read response stream");
      }

      const decoder = new TextDecoder();
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, {
          stream: true,
        });

        fullAnswer += chunk;
        setAnswer(fullAnswer);
      }
    } catch (error) {
      console.error("Suggestion error:", error);
      setAnswer("Unable to generate an answer. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
                disabled={isRecording || isTranscribing || isGenerating}
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

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken question will appear here..."
              className="min-h-24 w-full resize-none bg-transparent text-lg text-zinc-300 outline-none placeholder:text-zinc-600"
            />
          </div>


          <button
            onClick={suggestAnswer}
            disabled={
              !transcript || isRecording || isTranscribing || isGenerating
            }
            className="mb-6 w-full rounded-xl bg-zinc-100 py-4 font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Suggest Answer"}
          </button>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">✦</span>

              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Cue Answer
              </h3>
            </div>

            <p className="min-h-24 leading-7 text-zinc-300">
              {answer || "Your AI-generated answer will appear here..."}
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