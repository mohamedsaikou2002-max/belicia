# pemf_bridge.py — reads PEMF sensor and pushes to Lovable Cloud
import os, time, json, serial, requests, numpy as np
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BELICIA_API_URL = os.getenv("BELICIA_API_URL")
PEMF_API_KEY = os.getenv("PEMF_API_KEY")
USER_ID = os.getenv("USER_ID", "default")
PORT = os.getenv("PEMF_DEVICE_PORT", "/dev/ttyUSB0")


class PEMFSensor:
    def __init__(self, port, baud=115200):
        self.port, self.baud = port, baud
        self.ser = None
        self.window = 60

    def connect(self):
        try:
            self.ser = serial.Serial(self.port, self.baud, timeout=1)
            print(f"[PEMF] Connected: {self.port}")
            return True
        except Exception as e:
            print(f"[PEMF] Connect failed: {e}")
            return False

    def parse(self, line):
        try:
            parts = dict(p.split(":") for p in line.strip().split(","))
            return {
                "hrv_raw": float(parts.get("HRV", 0)),
                "field_strength": float(parts.get("FIELD", 0)),
                "dominant_freq": float(parts.get("FREQ", 0)),
                "skin_conductance": float(parts.get("SKIN", 0)),
            }
        except Exception:
            return None

    def hrv_score(self, buf):
        if len(buf) < 5: return 50.0
        vals = [b["hrv_raw"] for b in buf]
        rmssd = float(np.sqrt(np.mean(np.diff(vals) ** 2)))
        return round(min(100, max(0, (rmssd - 10) / 70 * 100)), 1)

    def coherence(self, buf):
        if len(buf) < 10: return 50.0
        vals = [b["hrv_raw"] for b in buf]
        fft = np.abs(np.fft.fft(vals))
        peak = float(np.max(fft[1:len(fft)//2]))
        total = float(np.sum(fft[1:len(fft)//2]))
        return round(min(100, (peak / total) * 100 if total > 0 else 50), 1)

    def stress(self, hrv, skin):
        return round((100 - hrv) * 0.7 + min(100, skin * 1000) * 0.3, 1)

    def loop(self, cb, interval=60):
        buf = []
        while True:
            try:
                if self.ser and self.ser.in_waiting:
                    line = self.ser.readline().decode("utf-8", errors="ignore")
                    p = self.parse(line)
                    if p:
                        buf.append(p)
                        if len(buf) > self.window: buf.pop(0)
                if len(buf) >= 5:
                    hrv = self.hrv_score(buf)
                    coh = self.coherence(buf)
                    latest = buf[-1]
                    cb({
                        "hrv_score": hrv,
                        "coherence_score": coh,
                        "stress_index": self.stress(hrv, latest["skin_conductance"]),
                        "dominant_frequency": latest["dominant_freq"],
                        "ambient_field_delta": latest["field_strength"],
                        "session_type": "passive",
                        "raw_data": {"sample_count": len(buf), "latest": latest},
                    })
                time.sleep(interval)
            except serial.SerialException as e:
                print(f"[PEMF] Serial error: {e}; reconnecting…")
                time.sleep(5); self.connect()
            except KeyboardInterrupt:
                print("[PEMF] stop"); break


def push(reading):
    try:
        r = requests.post(
            f"{BELICIA_API_URL}/functions/v1/pemf-ingest",
            json={"userId": USER_ID, "apiKey": PEMF_API_KEY, "readings": reading},
            timeout=10,
        )
        d = r.json()
        print(f"[PEMF] {d.get('recoveryState')} | {d.get('recommendation','')}")
    except Exception as e:
        print(f"[PEMF] push failed: {e}")


if __name__ == "__main__":
    s = PEMFSensor(PORT)
    if s.connect():
        s.loop(push, interval=60)
