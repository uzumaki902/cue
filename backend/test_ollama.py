from ollama import chat


stream = chat(
    model="qwen3:1.7b",
    messages=[
        {
            "role": "user",
            "content": "why is messi the best football player in the world? int 5 words"
        }
    ],
    stream=True
)

for chunk in stream:
    print(
        chunk["message"]["content"],
        end="",
        flush=True
    )