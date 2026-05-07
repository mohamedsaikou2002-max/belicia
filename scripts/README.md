# Belicia Home Node — Python scripts

These run on **your hardware** (mini PC / Mac Mini), not on Lovable.
They bridge a PEMF wearable, a local Ollama LLM, and Home Assistant
into the Belicia cloud app.

## Files

- `pemf_bridge.py` — reads PEMF sensor over serial, posts readings to the `pemf-ingest` edge function.
- `home_node_server.py` — Flask server exposing `/chat` (Ollama proxy), `/home/command` (HA scenes), `/pemf/trigger` (PEMF protocols).
- `morning_brief.py` — local cron job; generates a brief via Ollama → triggers morning scene → logs to `scheduled_briefs`.
- `.env.example` — copy to `.env` and fill in.

## Install

```bash
pip install requests websockets schedule python-dotenv \
            pyserial numpy scipy flask flask-cors supabase
```

## Lovable secrets to set
For the cloud edge functions to actually fire downstream, add these in
Lovable Cloud → Secrets:

- `PEMF_DEVICE_KEY` — must match the value in your `.env` here
- `HOME_ASSISTANT_WEBHOOK_URL` — public webhook URL for HA
- `PEMF_CONTROLLER_URL` — endpoint that controls your PEMF device

## Systemd
See the comments at the bottom of `home_node_server.py` for a sample
`belicia.service` unit and crontab line.
