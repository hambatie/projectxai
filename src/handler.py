import base64
import os
from runpod.serverless.handler import RunPodServerless
from faster_whisper import WhisperModel
from transformers import AutoTokenizer, AutoModelForCausalLM


TRANSCRIPT_FILE = "transcriptie.txt"
SUMMARY_FILE = "samenvatting.txt"
MODEL_NAME = "BramVanroy/GEITje-7B-ultra"
HF_TOKEN = os.environ.get("HUGGINGFACE_HUB_TOKEN")

whisper_model = WhisperModel("large-v3", compute_type="float16")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, token=HF_TOKEN)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, token=HF_TOKEN)

def transcribe_audio(base64_audio):
    audio_bytes = base64.b64decode(base64_audio)
    temp_path = "/tmp/input.wav"
    with open(temp_path, "wb") as f:
        f.write(audio_bytes)
    segments, _ = whisper_model.transcribe(temp_path, language="nl")
    transcript = " ".join([seg.text.strip() for seg in segments])
    return transcript

def summarize_text(text):
    prompt = f"Vat onderstaande tekst samen in het Nederlands:\n\n{text}\n\nSamenvatting:"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=200)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

def handler(job):
    job_input = job["input"]
    action = job_input.get("action")

    if action == "transcribe":
        base64_audio = job_input.get("audio_path")
        if not base64_audio:
            return { "error": "audio_path ontbreekt" }
        transcript = transcribe_audio(base64_audio)
        return { "output": { "transcript": transcript } }

    elif action == "summarize":
        transcript_text = job_input.get("transcript_text")
        if not transcript_text:
            return { "error": "transcript_text ontbreekt" }
        summary = summarize_text(transcript_text)
        return { "output": { "summary": summary } }

    else:
        return { "error": f"Ongeldige actie '{action}'" }

handler = RunPodServerless(handler)

