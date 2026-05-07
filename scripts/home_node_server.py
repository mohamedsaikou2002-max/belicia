# home_node_server.py — local Flask server bridging Ollama + Home Assistant
import os, requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
HA_URL = os.getenv("HOME_ASSISTANT_URL")
HA_TOKEN = os.getenv("HOME_ASSISTANT_TOKEN")

app = Flask(__name__)
CORS(app)


@app.route("/health")
def health():
    return jsonify({"status": "online", "model": OLLAMA_MODEL})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    messages = [{"role": "system", "content": data.get("systemPrompt", "")}] + data.get("messages", [])
    try:
        r = requests.post(f"{OLLAMA_URL}/api/chat",
                          json={"model": OLLAMA_MODEL, "messages": messages, "stream": False,
                                "options": {"temperature": 0.7, "num_predict": 1024}},
                          timeout=60)
        return jsonify({"response": r.json()["message"]["content"], "source": "local", "model": OLLAMA_MODEL})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


SCENES = {
    "focus_mode":       [("light", "turn_on", {"entity_id": "light.office", "brightness": 150, "color_temp": 4000})],
    "prayer_mode":      [("light", "turn_off", {"entity_id": "light.all_lights"})],
    "sleep_mode":       [("light", "turn_off", {"entity_id": "light.all_lights"})],
    "morning_energize": [("light", "turn_on", {"entity_id": "light.bedroom", "brightness": 255, "color_temp": 6500})],
    "recovery_mode":    [("light", "turn_on", {"entity_id": "light.living_room", "brightness": 80, "color_temp": 2700})],
}


@app.route("/home/command", methods=["POST"])
def home_command():
    data = request.json or {}
    action = data.get("action")
    headers = {"Authorization": f"Bearer {HA_TOKEN}", "Content-Type": "application/json"}
    executed = []
    for domain, service, body in SCENES.get(action, []):
        try:
            r = requests.post(f"{HA_URL}/api/services/{domain}/{service}",
                              json=body, headers=headers, timeout=5)
            if r.status_code == 200: executed.append(f"{domain}.{service}")
        except Exception as e:
            print(f"[HA] {e}")
    return jsonify({"success": True, "executed": executed})


PROTOCOLS = {
    "delta_2hz":    {"frequency": 2.0, "intensity": 0.3, "waveform": "sine"},
    "theta_8hz":    {"frequency": 8.0, "intensity": 0.4, "waveform": "sine"},
    "alpha_10hz":   {"frequency": 10.0, "intensity": 0.5, "waveform": "square"},
    "gamma_40hz":   {"frequency": 40.0, "intensity": 0.6, "waveform": "square"},
    "schumann_7hz": {"frequency": 7.83, "intensity": 0.35, "waveform": "sine"},
    "energize_10hz":{"frequency": 10.0, "intensity": 0.7, "waveform": "square"},
}


@app.route("/pemf/trigger", methods=["POST"])
def pemf_trigger():
    data = request.json or {}
    cfg = PROTOCOLS.get(data.get("protocol"))
    if not cfg: return jsonify({"error": "unknown protocol"}), 400
    cfg["duration_minutes"] = data.get("duration_minutes", 20)
    print(f"[PEMF] trigger {data.get('protocol')} {cfg}")
    # TODO: wire to your device (serial/BLE/REST)
    return jsonify({"success": True, "protocol": data.get("protocol"), "config": cfg})


if __name__ == "__main__":
    print(f"[Belicia] Home node up · ollama={OLLAMA_MODEL} ha={HA_URL}")
    app.run(host="0.0.0.0", port=8765)


# --- systemd unit (save to /etc/systemd/system/belicia.service) ---
# [Unit]
# Description=Belicia Home Node
# After=network.target ollama.service
# [Service]
# Type=simple
# User=belicia
# WorkingDirectory=/home/belicia
# EnvironmentFile=/home/belicia/.env
# ExecStart=/usr/bin/python3 /home/belicia/home_node_server.py
# Restart=always
# RestartSec=5
# [Install]
# WantedBy=multi-user.target
#
# Crontab line for morning brief at 5am:
#   0 5 * * * /usr/bin/python3 /home/belicia/morning_brief.py >> /var/log/belicia_brief.log 2>&1
