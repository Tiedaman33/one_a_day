from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)  # Enable CORS for all origins 

OLLAMA_URL = "http://localhost:11434/api/generate"
PROFILE_FILE = 'profile.json'

# API endpoints
@app.route('/api/profile', methods=['GET'])
def get_profile():
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, 'r') as f:
            data = json.load(f)
            return jsonify(data)
    return jsonify({})  # return empty if not found

@app.route('/api/profile', methods=['POST'])
def save_profile():
    data = request.get_json()
    with open(PROFILE_FILE, 'w') as f:
        json.dump(data, f)
    return jsonify({'message': 'Profile saved successfully'})

@app.route('/api/suggest', methods=['POST'])
def suggest():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'Text is required'}), 400

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": "qwen2:1.5b",
            "prompt": f"Improve this resume bullet point: \"{text}\"",
            "stream": False
        })

        if response.status_code != 200:
            return jsonify({'error': 'Ollama request failed'}), 500

        return jsonify({'suggestion': response.json()['response'].strip()})

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/generate-resume', methods=['POST'])
def generate_resume():
    data = request.get_json()
    
    job_description = data.get('jobDescription', '')
    base_resume = data.get('baseResume', '')

    if not job_description or not base_resume:
        return jsonify({'error': 'Job description and resume text are required'}), 400

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": "qwen2:1.5b",
            "prompt": f"Based on the job description:\n{job_description}\n\nTailor the following resume:\n{base_resume}",
            "stream": False
        })
        print("OLLAMA response status:", response.status_code)
        print("OLLAMA response body:", response.text)
    except Exception as e:
        print("Error contacting AI model:", e)
        return jsonify({'error': str(e)}), 500

    if response.status_code != 200:
        return jsonify({'error': 'Failed to get response from AI model'}), 500

    return jsonify({
        'generatedResume': response.json()['response'].strip()
    })

# Serve static frontend files and handle SPA routing
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
