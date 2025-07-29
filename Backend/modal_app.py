# modal_app.py
import modal
import requests

image = modal.Image.debian_slim().pip_install("requests")
stub = modal.App("resume-assistant")


OLLAMA_URL = "http://localhost:11434/api/generate"

@stub.function()
def suggest_improvement(text: str):
    response = requests.post(OLLAMA_URL, json={
        "model": "qwen2:1.5b",
        "prompt": f"Improve this resume bullet point: \"{text}\"",
        "stream": False
    })
    response.raise_for_status()
    return response.json()['response'].strip()


@stub.function(image=image)
def generate_tailored_resume(job_description: str, base_resume: str):
    import requests
    response = requests.post(OLLAMA_URL, json={
        "model": "qwen2:1.5b",
        "prompt": f"Based on the job description:\n{job_description}\n\nTailor the following resume:\n{base_resume}",
        "stream": False
    })
    response.raise_for_status()
    return response.json()['response'].strip()
