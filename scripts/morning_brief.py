# morning_brief.py — local cron entry (5am daily)
import os, json, requests
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BELICIA_API_URL = os.getenv("BELICIA_API_URL")
USER_ID = os.getenv("USER_ID", "default")
HOME_NODE_URL = "http://localhost:8765"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def context():
    profile = supabase.table("belicia_profile").select("*").eq("user_id", USER_ID).single().execute().data
    memories = supabase.table("belicia_memory").select("content,importance")\
        .eq("user_id", USER_ID).eq("role", "user")\
        .order("importance", desc=True).limit(5).execute().data
    pemf = supabase.table("pemf_readings").select("coherence_score,recovery_state,hrv_score")\
        .eq("user_id", USER_ID).order("timestamp", desc=True).limit(1).execute().data
    return {"profile": profile, "memories": memories, "pemf": pemf[0] if pemf else None}


def generate(ctx):
    p = ctx["profile"] or {}
    name = p.get("display_name") or "friend"
    missions = json.dumps(p.get("active_missions", []))
    pemf_line = ""
    if ctx["pemf"]:
        pemf_line = f"Biofield: coherence {ctx['pemf']['coherence_score']}/100 ({ctx['pemf']['recovery_state']})"
    mem_lines = "\n".join(f"- {m['content'][:120]}" for m in ctx["memories"])
    prompt = f"""Generate a morning brief for {name}.
Active missions: {missions}
Strategic context: {p.get('strategic_context','—')}
{pemf_line}
Recent themes:
{mem_lines}

Structure:
1. One ayah/hadith with citation
2. Strategic reflection on mission (2-3 sentences)
3. One intention for today (one sentence)
{'4. Biofield guidance (one sentence)' if ctx['pemf'] else ''}

Under 150 words. Speak directly to {name}."""
    system = "You are Belicia — Bayt al-Hikmah grounded, direct, warm, brief, real."
    try:
        r = requests.post(f"{HOME_NODE_URL}/chat",
                          json={"systemPrompt": system, "messages": [{"role": "user", "content": prompt}]},
                          timeout=45)
        return r.json()["response"]
    except Exception:
        r = requests.post(f"{BELICIA_API_URL}/functions/v1/chat",
                          json={"message": prompt, "userId": USER_ID, "inquiryMode": "wisdom"},
                          timeout=45)
        return r.json()["response"]


def deliver(text):
    supabase.table("scheduled_briefs").insert({
        "user_id": USER_ID, "brief_type": "morning", "content": text,
        "delivery_channel": "audio", "status": "delivered",
        "delivered_at": datetime.now().isoformat(),
    }).execute()
    try:
        requests.post(f"{HOME_NODE_URL}/home/command",
                      json={"type": "scene", "action": "morning_energize"}, timeout=5)
        requests.post(f"{HOME_NODE_URL}/pemf/trigger",
                      json={"protocol": "energize_10hz", "duration_minutes": 15}, timeout=5)
    except Exception as e:
        print(f"[Brief] downstream trigger failed: {e}")
    print("=" * 60); print(text); print("=" * 60)


if __name__ == "__main__":
    deliver(generate(context()))
