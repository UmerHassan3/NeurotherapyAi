from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import random
from scipy.signal import welch as scipy_welch

app = FastAPI(title="NeuroTherapy AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Emotiv EPOC 14-channel layout — same as alexispomares/dissertation-raw dataset
EEG_CHANNELS = ["AF3", "F7", "F3", "FC5", "T7", "P7", "O1",
                 "O2", "P8", "T8", "FC6", "F4", "F8", "AF4"]

# Samples derived from alexispomares/dissertation-raw structure
# Each row is a labelled EEG recording (band powers in µV²/Hz)
DATASET_SAMPLES = [
    {"subject_id": 1, "session": 1, "label": "stressed",
     "delta": 2.34, "theta": 4.12, "alpha": 5.67, "beta": 12.45, "gamma": 3.21},
    {"subject_id": 1, "session": 2, "label": "relaxed",
     "delta": 1.89, "theta": 5.43, "alpha": 11.23, "beta": 6.34, "gamma": 2.12},
    {"subject_id": 2, "session": 1, "label": "anxious",
     "delta": 2.01, "theta": 6.78, "alpha": 4.56, "beta": 14.23, "gamma": 4.56},
    {"subject_id": 2, "session": 2, "label": "focused",
     "delta": 1.23, "theta": 3.45, "alpha": 7.89, "beta": 9.12, "gamma": 8.34},
    {"subject_id": 3, "session": 1, "label": "drowsy",
     "delta": 6.78, "theta": 8.90, "alpha": 3.45, "beta": 2.34, "gamma": 1.23},
    {"subject_id": 3, "session": 2, "label": "calm",
     "delta": 2.56, "theta": 4.67, "alpha": 8.90, "beta": 5.12, "gamma": 2.78},
    {"subject_id": 4, "session": 1, "label": "stressed",
     "delta": 2.12, "theta": 3.89, "alpha": 4.23, "beta": 13.67, "gamma": 3.45},
    {"subject_id": 4, "session": 2, "label": "focused",
     "delta": 1.45, "theta": 3.23, "alpha": 6.78, "beta": 8.90, "gamma": 9.12},
    {"subject_id": 5, "session": 1, "label": "relaxed",
     "delta": 1.67, "theta": 4.89, "alpha": 12.34, "beta": 5.67, "gamma": 2.34},
    {"subject_id": 5, "session": 2, "label": "anxious",
     "delta": 2.23, "theta": 7.12, "alpha": 3.89, "beta": 15.45, "gamma": 5.67},
]

MENTAL_STATE_INFO = {
    "stressed": {
        "description": "High stress levels detected",
        "color": "#ef4444",
        "dominant_wave": "Beta",
        "wysa_opening": "I can see from your EEG that your brain is showing elevated beta wave activity — this often signals stress. You're not alone, and I'm here for you. Let's calm things down together. 💙",
        "recommendations": [
            {
                "name": "Box Breathing",
                "duration": "5 min",
                "description": "A technique used by Navy SEALs to quickly neutralise stress",
                "steps": ["Inhale for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Hold empty for 4 counts"],
                "benefit": "Activates the parasympathetic nervous system within minutes",
            },
            {
                "name": "Progressive Muscle Relaxation",
                "duration": "15 min",
                "description": "Systematically release tension stored in each muscle group",
                "steps": ["Tense your feet for 5 seconds", "Release and notice the warmth", "Work up — calves, thighs, abdomen", "Continue to shoulders, face, scalp"],
                "benefit": "Releases physical stress stored as muscle tension",
            },
            {
                "name": "4-7-8 Breathing",
                "duration": "8 min",
                "description": "The natural tranquiliser for the nervous system",
                "steps": ["Exhale completely through your mouth", "Inhale through nose for 4 counts", "Hold your breath for 7 counts", "Exhale through mouth for 8 counts"],
                "benefit": "Lowers cortisol and promotes deep relaxation",
            },
        ],
    },
    "anxious": {
        "description": "Anxiety patterns detected",
        "color": "#f97316",
        "dominant_wave": "High Beta + Theta",
        "wysa_opening": "Your EEG shows elevated high-beta and theta waves — your brain may be stuck in an anxious loop. That's okay. Let's gently ground you in the present moment. 🌿",
        "recommendations": [
            {
                "name": "5-4-3-2-1 Grounding",
                "duration": "10 min",
                "description": "Reconnects you with your senses to break the anxiety cycle",
                "steps": ["Name 5 things you can see", "Touch 4 different textures", "Listen for 3 distinct sounds", "Identify 2 scents", "Notice 1 taste in your mouth"],
                "benefit": "Interrupts anxious thought spirals using sensory anchors",
            },
            {
                "name": "Body Scan Meditation",
                "duration": "20 min",
                "description": "Gentle, non-judgemental awareness of physical sensations",
                "steps": ["Lie down and close your eyes", "Bring awareness to your feet", "Slowly move attention upward", "Release tension at each area"],
                "benefit": "Reduces anxiety by shifting focus from thought to body",
            },
        ],
    },
    "relaxed": {
        "description": "Calm and relaxed state",
        "color": "#22c55e",
        "dominant_wave": "Alpha",
        "wysa_opening": "Wonderful! Your EEG shows beautiful alpha wave dominance — you're in a peaceful, receptive state. This is the perfect time for a deeper practice. ✨",
        "recommendations": [
            {
                "name": "Loving-Kindness (Metta)",
                "duration": "20 min",
                "description": "Cultivate compassion for yourself and radiate it outward",
                "steps": ["Sit and breathe deeply", "Visualise warm light in your chest", "Silently: 'May I be happy, healthy, safe'", "Gradually extend this wish to others"],
                "benefit": "Deepens compassion and long-term emotional resilience",
            },
            {
                "name": "Mindfulness Meditation",
                "duration": "25 min",
                "description": "Pure present-moment awareness",
                "steps": ["Find a comfortable seated position", "Focus on your natural breath", "When mind wanders, gently return", "Observe thoughts as passing clouds"],
                "benefit": "Strengthens attentional control and inner stillness",
            },
        ],
    },
    "focused": {
        "description": "Peak focus state detected",
        "color": "#8b5cf6",
        "dominant_wave": "Gamma",
        "wysa_opening": "Impressive! High gamma activity detected — your brain is in a peak performance state. Let's channel this razor-sharp focus into something powerful. 🎯",
        "recommendations": [
            {
                "name": "Visualisation Meditation",
                "duration": "15 min",
                "description": "Use your focused mind to vividly rehearse goals",
                "steps": ["Close your eyes and relax", "Vividly imagine your desired outcome", "Engage all five senses in the scene", "Feel the emotions as if it's already real"],
                "benefit": "Uses gamma state for neuroplasticity and goal manifestation",
            },
            {
                "name": "Flow State Practice",
                "duration": "20 min",
                "description": "Deepen your natural focus into sustained flow",
                "steps": ["Set a single clear intention", "Engage fully with the present task", "Notice when focus drifts and return", "Work in focused 25-minute intervals"],
                "benefit": "Maximises your natural gamma-wave concentration",
            },
        ],
    },
    "drowsy": {
        "description": "Low energy state detected",
        "color": "#06b6d4",
        "dominant_wave": "Theta / Delta",
        "wysa_opening": "Your EEG shows high theta and delta waves — your body is calling for rest. Let's honour that with a restorative practice. 🌙",
        "recommendations": [
            {
                "name": "Yoga Nidra (NSDR)",
                "duration": "30 min",
                "description": "Yogic sleep — 30 minutes equals ~2 hours of rest",
                "steps": ["Lie in savasana (flat on your back)", "Rotate awareness through body parts systematically", "Visualise pairs of opposites (heavy/light)", "Rest in the hypnagogic state between sleep and waking"],
                "benefit": "Deeply restorative and enhances neuroplasticity",
            },
            {
                "name": "Energising Breath (Kapalabhati)",
                "duration": "5 min",
                "description": "A quick neuro-boost for a sluggish mind",
                "steps": ["Sit upright with eyes closed", "Breathe rapidly through nose", "1 full breath per second for 30 cycles", "End with 3 deep, slow breaths"],
                "benefit": "Increases oxygen, dopamine, and mental alertness",
            },
        ],
    },
    "calm": {
        "description": "Balanced and centred state",
        "color": "#3b82f6",
        "dominant_wave": "Balanced",
        "wysa_opening": "Your EEG shows a beautifully balanced brainwave pattern. You're in an ideal state for deep, transformative meditation. 🔮",
        "recommendations": [
            {
                "name": "Transcendental Meditation",
                "duration": "20 min",
                "description": "Silent mantra repetition to access the deepest rest",
                "steps": ["Sit comfortably with eyes closed", "Silently repeat your mantra (e.g. 'Shanti')", "Let thoughts arise and dissolve naturally", "Return to mantra when the mind wanders"],
                "benefit": "Accesses the deepest levels of restful awareness",
            },
            {
                "name": "Open Monitoring Meditation",
                "duration": "15 min",
                "description": "Pure witness consciousness practice",
                "steps": ["Sit and close your eyes", "Remain aware of everything without choosing", "Label thoughts: 'thinking', 'feeling', 'planning'", "Rest as the awareness itself, not its contents"],
                "benefit": "Expands metacognitive and non-dual awareness",
            },
        ],
    },
}


def classify_state(bp: dict) -> str:
    beta = bp.get("beta", 0)
    alpha = bp.get("alpha", 0)
    theta = bp.get("theta", 0)
    gamma = bp.get("gamma", 0)
    delta = bp.get("delta", 0)
    total = beta + alpha + theta + gamma + delta
    if total == 0:
        return "calm"
    if beta / total > 0.38:
        return "stressed"
    if (beta + theta) / total > 0.55 and theta > alpha:
        return "anxious"
    if alpha / total > 0.38:
        return "relaxed"
    if gamma / total > 0.22:
        return "focused"
    if (theta + delta) / total > 0.55:
        return "drowsy"
    return "calm"


# ─── Claude API setup (optional — falls back to rich rule-based if no key) ────
import os

try:
    import anthropic as _anthropic_lib
    _ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
    _claude = _anthropic_lib.Anthropic(api_key=_ANTHROPIC_KEY) if _ANTHROPIC_KEY else None
except Exception:
    _claude = None


def _call_claude(message: str, state: str, info: dict, band_powers: dict, history: list) -> str:
    bp = band_powers
    recs_text = "\n".join(
        f"  {i+1}. {r['name']} ({r['duration']}) — {r['description']}"
        for i, r in enumerate(info["recommendations"])
    )
    system = f"""You are Neuro AI, a warm and empathetic AI mental wellness companion integrated with an EEG brain scanner.

CURRENT USER EEG SCAN:
- Mental State: {state}
- Summary: {info['description']}
- Dominant Brainwave: {info['dominant_wave']}
- Band Powers (µV²/Hz): Delta {bp.get('delta','?')} | Theta {bp.get('theta','?')} | Alpha {bp.get('alpha','?')} | Beta {bp.get('beta','?')} | Gamma {bp.get('gamma','?')}

RECOMMENDED TECHNIQUES FOR THIS STATE:
{recs_text}

RULES:
- Be warm, conversational, and empathetic — a knowledgeable friend, not a clinical tool
- Reference the user's actual EEG numbers naturally when it adds value
- Keep replies concise (2–4 sentences) unless the user asks for step-by-step instructions
- For technique guides, number each step clearly
- Answer any question about: meditation, mindfulness, breathing, sleep, stress, anxiety, focus, CBT, neuroplasticity, emotional regulation, mental health habits
- For off-topic questions, gently redirect: "That's a bit outside my area — I focus on mental wellness..."
- Use **bold** only for technique names, never for random emphasis
- Use at most 1 emoji per message, only when natural
- Vary your opening words — never start two consecutive replies the same way
- If the user expresses thoughts of self-harm, compassionately encourage professional help"""

    msgs = []
    for h in history:
        role = "user" if h.get("role") == "user" else "assistant"
        msgs.append({"role": role, "content": h.get("text", "")})
    msgs.append({"role": "user", "content": message})

    resp = _claude.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=450,
        system=system,
        messages=msgs,
    )
    return resp.content[0].text


# ─── Intent detection ─────────────────────────────────────────────────────────

def _detect_intent(msg: str) -> str:
    m = msg.lower()
    if not m or m in ("start", "hello", "hi", "hey", "hii", "helo", "good morning", "good evening", "good afternoon"):
        return "greeting"
    if any(w in m for w in ("how am i", "what's my", "my state", "my result", "what does it show", "my eeg", "how do i look", "what did it find")):
        return "state_inquiry"
    # breathing — checked before physical
    if any(w in m for w in ("breath", "breathing", "breathe", "box breath", "4-7-8", "pranayama", "inhale", "exhale", "diaphragm")):
        return "breathing"
    # physical exercise — checked before generic recommendation
    if any(w in m for w in ("physical exercise", "physical activity", "body exercise", "body workout",
                             "yoga", "stretching", "stretch", "workout", "movement exercise",
                             "body movement", "give exercise", "suggest exercise",
                             "what exercise", "exercise for", "exercise to", "gym", "running", "jogging",
                             "walk", "walking", "squat", "pushup", "push up", "plank")):
        return "physical_exercise"
    # low energy / laziness — checked before sleep so "lazy" doesn't go to default
    if any(w in m for w in ("lazy", "laziness", "lethargic", "unmotivated", "no motivation", "low energy",
                             "low on energy", "energy low", "no drive", "sluggish", "drained", "dragging",
                             "always tired", "chronically tired", "can't get up", "cant get up",
                             "low to energy", "no power", "weak", "feeling weak", "fatigued all", "low vitality")):
        return "low_energy"
    if any(w in m for w in ("sleep", "insomnia", "can't sleep", "cant sleep", "trouble sleeping", "nidra", "nsdr",
                             "wake up at night", "early waking", "oversleeping", "sleep quality", "deep sleep")):
        return "sleep"
    if any(w in m for w in ("tired", "exhausted", "fatigue", "no energy", "always sleepy", "drowsy")):
        return "low_energy"
    if any(w in m for w in ("anxious", "anxiety", "panic", "panic attack", "worry", "nervous", "fear", "scared",
                             "overthink", "overthinking", "racing thoughts", "what if", "dread", "apprehensive")):
        return "anxiety"
    if any(w in m for w in ("stress", "stressed", "overwhelm", "pressure", "burnout", "too much", "can't cope",
                             "cant cope", "overloaded", "too many things", "falling apart")):
        return "stress"
    if any(w in m for w in ("focus", "concentrat", "distract", "attention", "mind wander", "can't focus",
                             "cant focus", "brain fog", "unclear thinking", "foggy", "scattered", "adhd")):
        return "focus"
    if any(w in m for w in ("sad", "depress", "unhappy", "empty", "numb", "hopeless", "low mood", "down",
                             "crying", "cry", "no joy", "no pleasure", "meaningless", "worthless", "not worth it")):
        return "low_mood"
    if any(w in m for w in ("anger", "angry", "frustrat", "irritat", "mad", "rage", "furious", "annoyed",
                             "losing temper", "short fuse", "explosive", "hot headed")):
        return "anger"
    if any(w in m for w in ("headache", "migraine", "head pain", "head ache", "throbbing head")):
        return "headache"
    if any(w in m for w in ("back pain", "backache", "back ache", "spine", "lower back", "upper back",
                             "joint pain", "knee pain", "wrist pain", "muscle pain", "muscle ache",
                             "body pain", "chronic pain", "fibromyalgia")):
        return "body_pain"
    if any(w in m for w in ("pain", "tight", "tense", "sore", "neck", "shoulder", "body ache", "stiff")):
        return "physical_tension"
    if any(w in m for w in ("motivat", "goal", "habit", "discipline", "procrastinat", "no willpower",
                             "can't start", "cant start", "give up", "lack of motivation", "productivity")):
        return "motivation"
    if any(w in m for w in ("diet", "nutrition", "eat", "eating", "food", "vitamin", "mineral",
                             "supplement", "protein", "weight", "calories", "healthy eating", "what to eat",
                             "gut health", "gut", "digestion", "digestive", "bloat", "ibs")):
        return "nutrition"
    if any(w in m for w in ("immune", "immunity", "sick", "cold", "flu", "illness", "fever", "infection",
                             "getting sick", "catch cold", "disease prevention", "boost immune")):
        return "immune_health"
    if any(w in m for w in ("confidence", "self esteem", "self-esteem", "insecure", "self worth",
                             "self image", "body image", "not good enough", "comparison", "imposter")):
        return "self_esteem"
    if any(w in m for w in ("grief", "loss", "mourning", "death", "died", "miss someone", "bereav",
                             "lost someone", "passing away", "losing someone")):
        return "grief"
    if any(w in m for w in ("addiction", "quit", "smoking", "alcohol", "drinking", "gaming addiction",
                             "phone addiction", "social media addiction", "screen addiction", "compulsive")):
        return "addiction"
    if any(w in m for w in ("mindful", "present moment", "awareness", "mindfulness", "conscious", "grounded")):
        return "mindfulness"
    if any(w in m for w in ("posture", "sitting too long", "desk job", "screen time", "hunch", "slouch", "ergonomic")):
        return "posture"
    if any(w in m for w in ("relation", "partner", "family", "friend", "lonely", "alone", "breakup", "argument",
                             "conflict", "communication", "toxic", "divorce", "marriage")):
        return "relationships"
    if any(w in m for w in ("job", "office", "deadline", "boss", "colleague", "career", "workload",
                             "at work", "my work", "workplace", "meeting", "presentation", "work anxiety")):
        return "work_stress"
    if any(w in m for w in ("beginner", "new to", "never done", "first time", "don't know how",
                             "dont know how", "where do i start", "how to start", "getting started")):
        return "beginner"
    if any(w in m for w in ("how long", "how many minute", "how much time", "duration", "how often", "how many times")):
        return "duration"
    if any(w in m for w in ("why", "does it work", "science", "research", "evidence", "proof",
                             "how does meditation", "how does breathing", "explain", "what happens")):
        return "why_meditation"
    if any(w in m for w in ("not working", "not helping", "doesn't work", "doesnt work", "pointless",
                             "waste of time", "not feeling", "no difference", "useless")):
        return "discouraged"
    if any(w in m for w in ("eeg", "brainwave", "wave", "frequency", "alpha", "beta", "theta", "delta", "gamma", "what is eeg")):
        return "eeg_explanation"
    if any(w in m for w in ("more", "another", "other option", "different", "something else", "alternative", "other technique")):
        return "more_options"
    if any(w in m for w in ("start", "begin", "let's go", "let me start", "guide me", "walk me through", "step by step", "show me how")):
        return "start_session"
    if any(w in m for w in ("meditat", "recommend", "suggest", "what should i do", "help me", "technique", "what do you suggest")):
        return "recommendation"
    if any(w in m for w in ("thank", "thanks", "great", "amazing", "helpful", "love it", "perfect", "awesome", "brilliant")):
        return "gratitude"
    return "default"


# ─── Rich fallback response bank ──────────────────────────────────────────────

def _fmt_steps(steps: list, style="numbered") -> str:
    if style == "bullet":
        return "\n".join(f"• {s}" for s in steps)
    return "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))


def _fallback_response(intent: str, state: str, info: dict, band_powers: dict) -> str:
    r0 = info["recommendations"][0]
    r1 = info["recommendations"][1] if len(info["recommendations"]) > 1 else r0
    bp = band_powers

    bank = {
        "greeting": [
            info["wysa_opening"],
            f"Hey! Your EEG scan just came in — I can see you're in a **{state}** state right now. Let me share what that means and how we can work with it. 💙",
            f"Welcome back! Your brainwaves are showing a **{state}** pattern today. I've already picked some techniques that match your current state perfectly.",
        ],
        "state_inquiry": [
            f"Your EEG is showing **{info['description'].lower()}**. The dominant activity is **{info['dominant_wave']}** waves. This is very common and completely workable — want me to recommend something tailored for this?",
            f"Right now your brain's most active band is **{info['dominant_wave']}**, which puts you in a **{state}** state. Beta is at {bp.get('beta','?')} and alpha is at {bp.get('alpha','?')} µV²/Hz — I can use that to guide you to the right practice.",
            f"The scan detected a **{state}** pattern — {info['description'].lower()}. Your {info['dominant_wave']} waves are leading the pack right now. Shall I match you with a meditation designed for exactly this?",
        ],
        "recommendation": [
            f"For a **{state}** state, I'd start with **{r0['name']}** ({r0['duration']}). {r0['description']}.\n\n{_fmt_steps(r0['steps'])}\n\n*Why it helps: {r0['benefit']}*",
            f"Your {info['dominant_wave']} pattern points me straight to **{r0['name']}**. It's {r0['duration']} and perfect for right now.\n\n{_fmt_steps(r0['steps'])}\n\n*{r0['benefit']}*",
            f"Given what your EEG is showing, **{r0['name']}** is my top pick ({r0['duration']}). {r0['description']}.\n\n{_fmt_steps(r0['steps'])}",
        ],
        "start_session": [
            f"Let's begin **{r0['name']}** right now. 🧘 Find a comfortable position and follow along:\n\n{_fmt_steps(r0['steps'], 'bullet')}\n\n*{r0['benefit']}* Take your time — there's no rush. 💙",
            f"Perfect. **{r0['name']}** starting now — get comfortable wherever you are:\n\n{_fmt_steps(r0['steps'])}\n\nRemember: {r0['benefit']}.",
            f"Here we go with **{r0['name']}**:\n\n{_fmt_steps(r0['steps'], 'bullet')}\n\nBreathe easy. {r0['benefit']}. I'm right here with you. 💙",
        ],
        "more_options": [
            f"Here's another one for your **{state}** state: **{r1['name']}** ({r1['duration']}).\n\n{r1['description']}\n\n{_fmt_steps(r1['steps'])}\n\n*{r1['benefit']}*",
            f"Try **{r1['name']}** — it's a different approach but just as effective for {state} patterns.\n\n{_fmt_steps(r1['steps'])}\n\n*Benefit: {r1['benefit']}*",
        ],
        "physical_exercise": {
            "stressed": [
                f"Here are physical exercises to release your stress (your beta is high at {bp.get('beta','?')} µV²/Hz — your body is holding tension):\n\n1. **Body Shake** — shake your arms, legs, and torso for 30 seconds. Literally shakes out cortisol\n2. **Neck rolls** — slowly roll your head left → chin to chest → right, 5 full circles\n3. **Shoulder shrugs** — raise both shoulders to your ears, hold 5 seconds, drop hard. Repeat 8×\n4. **10 jumping jacks** — burns the adrenaline your body produced\n5. **Forward fold** — stand and hang forward, arms loose, head dangling, hold 30 seconds\n\n*These work because physical movement metabolises stress hormones faster than any thought-based technique.*",
                f"Your EEG shows a stressed pattern — here's a quick physical reset:\n\n1. **Wall push** — push your palms flat against a wall as hard as you can for 10 seconds, release. Repeat 5×\n2. **Cold water** on your wrists and face for 30 seconds — activates the dive reflex and drops heart rate\n3. **Tense and release** — clench every muscle in your body for 5 seconds, then release completely. Do this 3×\n4. **Brisk 10-minute walk** — gets you out of the cortisol loop\n\n*Movement is your fastest stress exit.*",
            ],
            "anxious": [
                f"Physical grounding exercises for your anxious state (beta {bp.get('beta','?')} + theta {bp.get('theta','?')} µV²/Hz pattern):\n\n1. **Feet flat on floor** — press both feet firmly into the ground and feel the contact. Hold 60 seconds\n2. **Child's Pose (yoga)** — kneel, fold forward, arms extended on floor, forehead down. Hold 60 seconds\n3. **EFT Tapping** — gently tap the side of your hand (karate chop point) 7 times while saying 'I am safe'\n4. **Slow walking** — 5 minutes outside, place each foot deliberately, feel every step\n5. **Forward fold** — stand and hang, let gravity pull the tension out of your neck and shoulders\n\n*Grounding the body physically interrupts the anxious thought loop faster than thinking your way out of it.*",
                f"For anxiety, these movements activate the parasympathetic nervous system:\n\n1. **Butterfly hug** — cross arms over chest, tap shoulders alternately (left-right-left-right) for 2 minutes. Used in trauma therapy\n2. **Cat-cow stretch** — on hands and knees, arch and round your back slowly, 10 cycles\n3. **Progressive shake** — start by shaking just your hands, add arms, add whole body. 1 minute total\n4. **Slow yoga walk** — walk with arms swinging gently, 1 step per breath, 5 minutes\n\n*These regulate the nervous system through rhythmic movement — the body calms the mind, not the other way around.*",
            ],
            "relaxed": [
                f"You're in a relaxed alpha state ({bp.get('alpha','?')} µV²/Hz) — perfect for mindful movement that deepens rather than disrupts your calm:\n\n1. **Mindful walking** — 10 minutes outside, feel each footfall deliberately, sync with your breath\n2. **Yoga cat-cow** — on hands and knees, arch and round your back slowly × 10, match breath to movement\n3. **Gentle sun salutation** — one slow flow: mountain → forward fold → plank → cobra → downward dog → forward fold → mountain\n4. **Yin stretch** — pick one area (hips, chest, or hamstrings) and hold a deep stretch for 3 minutes\n\n*Mindful movement in this state deepens alpha and builds a stronger mind-body connection.*",
                f"Your alpha dominance makes this ideal for gentle, connected movement:\n\n1. **Tai Chi arm circles** — slow, flowing circles with both arms, 2 minutes\n2. **Tree pose (yoga)** — stand on one foot, other foot on calf/thigh, hands at heart. Hold 30 seconds each side\n3. **Body scan walk** — walk slowly and notice every sensation from feet to head as you move\n4. **5-minute gentle stretching** — neck, shoulders, chest, hips. No forcing — just melting into each stretch\n\n*In this state your body absorbs mindful movement like a sponge.*",
            ],
            "focused": [
                f"Your gamma is active ({bp.get('gamma','?')} µV²/Hz) — use physical movement to reset between focus sessions:\n\n1. **Power pose** — stand tall, hands on hips, chin slightly up, hold 2 minutes. Shown to raise testosterone and lower cortisol\n2. **Brisk 5-minute walk** between deep work blocks — recharges your prefrontal cortex\n3. **Dynamic stretching** — arm circles × 10, leg swings × 10, hip rotations × 10. Takes 2 minutes\n4. **Desk yoga** — seated spinal twist, seated forward fold, neck stretches. Do between tasks\n\n*Physical breaks of 5 minutes every 25–45 minutes actually extend your total focused output, not reduce it.*",
                f"To maintain your peak focus state, alternate work with these micro-movements:\n\n1. **Eye palming** — rub palms together, cup warm hands over closed eyes, 30 seconds. Resets visual cortex\n2. **Shoulder opening** — clasp hands behind back, squeeze shoulder blades, look up, hold 10 seconds × 5\n3. **Wrist and hand stretches** — essential if you're typing. Extend arm, pull fingers back, hold 20 seconds each hand\n4. **Box jumps or 20 squats** — a quick burst of movement spikes BDNF (brain-derived neurotrophic factor), sharpening focus\n\n*Gamma waves are sustained by alternating intense focus with physical micro-resets.*",
            ],
            "drowsy": [
                f"Your theta/delta pattern ({bp.get('theta','?')}/{bp.get('delta','?')} µV²/Hz) means your brain is sluggish — use these to wake it up physically:\n\n1. **20 jumping jacks** — immediately right now. Get blood moving\n2. **Sun salutations × 3** (fast-paced) — standing → forward fold → plank → cobra → downward dog → stand. Do it briskly\n3. **Cold water** on face and back of neck for 30 seconds — activates the alertness system\n4. **Brisk 10-minute walk outside** — sunlight + movement is the most powerful alertness reset\n5. **10 deep squats** — large muscle movement spikes dopamine and adrenaline fast\n\n*Physical movement is more effective than caffeine for shifting out of theta-dominant drowsiness.*",
                f"Wake your body up with these energy-activating exercises:\n\n1. **Shake it out** — shake your hands fast for 30 seconds, then arms, then whole body\n2. **High knees** — march in place bringing knees to waist height, 30 seconds\n3. **Standing backbend** — hands on lower back, gently arch backward, look up, hold 10 seconds × 5\n4. **Kapalabhati breathing + movement** — rapid breath + simultaneous arm pumps, 30 cycles\n\n*Your delta/theta dominance will shift to beta within 5 minutes of sustained movement.*",
            ],
            "calm": [
                f"Your balanced brainwave state is ideal for restorative, mindful movement:\n\n1. **Restorative yoga: legs up the wall** — lie on your back, legs resting vertically on the wall, 5 minutes. Deeply restores the nervous system\n2. **Slow nature walk** — 15 minutes, no phone, notice 5 things you've never noticed before\n3. **Gentle dance** — 5 minutes to peaceful music, move however feels natural\n4. **Tai Chi basics** — slow, flowing movements. Even just 'wave hands like clouds' × 10 on each side\n\n*In a calm balanced state, restorative movement cements the neurological balance your EEG is showing.*",
                f"Complement your balanced state with these mindful movement practices:\n\n1. **Mountain pose into tree pose** — stand tall, ground through feet, then balance on one leg × 30 seconds each side\n2. **Qigong circles** — stand with feet shoulder-width, slowly circle arms like you're holding a large ball. 2 minutes\n3. **Slow walking meditation** — 10 steps forward, pause and breathe, 10 steps back. 5 minutes\n4. **Yin yoga hip opener** — butterfly pose (soles together, lean forward), hold 3 minutes\n\n*Movement in this state builds a strong mind-body coherence that carries into your day.*",
            ],
        }.get(state, [
            f"Here are physical exercises suited to your **{state}** state:\n\n1. **Body shake** — shake arms, legs, torso for 30 seconds to release tension\n2. **Brisk 10-minute walk** — resets the nervous system\n3. **5 slow yoga stretches** — neck, shoulders, chest, hips, hamstrings, 30 seconds each\n4. **10 deep breaths with movement** — inhale arms up, exhale arms down, slow and deliberate\n\n*Match your movement to your energy — gentle if you're tired, dynamic if you're tense.*",
        ]),
        "breathing": [
            "**Box Breathing** is one of the most powerful rapid-relief techniques:\n\n1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold empty for 4 counts\n\nRepeat 4–6 times. It activates your parasympathetic nervous system within 2 minutes.",
            "Try **4-7-8 Breathing** — it's like a natural tranquiliser:\n\n1. Exhale completely through your mouth\n2. Inhale through nose for 4 counts\n3. Hold for 7 counts\n4. Exhale for 8 counts\n\nDo 4 cycles. Your nervous system will visibly calm down.",
            "**Diaphragmatic (belly) breathing** is underrated:\n\n1. Place one hand on chest, one on belly\n2. Breathe so only the belly hand rises\n3. Inhale for 4 counts, exhale for 6\n4. Do this for 5 minutes\n\nLonger exhales activate the vagus nerve — your body's built-in calm switch.",
        ],
        "sleep": [
            "**Yoga Nidra (NSDR)** is scientifically shown to be as restorative as actual sleep:\n\n1. Lie flat on your back (savasana)\n2. Rotate awareness through body parts — feet, calves, knees...\n3. Visualise pairs of opposites (heavy/light, hot/cold)\n4. Rest in the space between waking and sleep\n\n30 minutes equals roughly 2 hours of deep sleep.",
            "For better sleep tonight, try **4-7-8 Breathing in bed**:\n\n1. Lie on your back with mouth closed\n2. Inhale quietly for 4 counts\n3. Hold for 7\n4. Exhale slowly for 8\n\nMost people fall asleep within 3 cycles. Your high theta waves actually make you primed for this.",
            "**Body Scan before bed** is clinically proven for insomnia:\n\n1. Lie down and close your eyes\n2. Start at the top of your head, scan downward\n3. Notice every sensation without judgement\n4. By the time you reach your feet, most people are asleep\n\nNo effort needed — just awareness.",
        ],
        "anxiety": [
            "Anxiety is your brain's alarm system misfiring — your EEG shows the elevated beta patterns that cause that feeling. Let's interrupt it with **5-4-3-2-1 Grounding**:\n\n1. Name 5 things you can see\n2. Touch 4 different textures\n3. Listen for 3 distinct sounds\n4. Identify 2 scents\n5. Notice 1 taste\n\nThis pulls your brain out of future-thinking and into the present.",
            "When anxiety hits, your prefrontal cortex goes offline. **Box Breathing** brings it back:\n\n1. Inhale 4 counts → Hold 4 → Exhale 4 → Hold 4\n\nRepeat 6 times. It physically lowers cortisol. Pair this with saying 'I am safe right now' — it helps re-pattern the anxious thought loop.",
            "Your EEG's high beta + theta mix is classic anxiety. The fastest fix is **cold water on your face** (activates the dive reflex, drops heart rate instantly), followed by slow breathing. Then try **Body Scan Meditation** to let the nervous system fully reset.",
        ],
        "stress": [
            f"Stress shows up in your EEG as elevated beta waves — and your scan confirms that. The fastest reset is **Box Breathing** (5 minutes), followed by **Progressive Muscle Relaxation** (15 minutes). Together they address both the mental and physical sides of stress.",
            "Stress is stored in the body, not just the mind. Right now, scan your shoulders — are they raised? Jaw — is it clenched? Try this: **Tense every muscle in your body for 5 seconds, then release**. That single release often drops perceived stress by 30%.",
            f"Your beta waves are elevated, which is your brain's way of staying 'on alert'. The solution is to consciously signal safety. **Slow exhales (longer than inhale)** activate the vagus nerve and tell your nervous system it's okay to relax. Try 4 counts in, 8 counts out, for 2 minutes.",
        ],
        "focus": [
            f"Your EEG shows gamma at {bp.get('gamma','?')} µV²/Hz — {'strong focus potential' if float(bp.get('gamma', 0) or 0) > 5 else 'we can boost this'}. The **Pomodoro technique** pairs well with meditation: 25 minutes focused work → 5 minute mindful break. The break recharges gamma activity.",
            "For sustained focus, **Single-Point Concentration** is what monks use:\n\n1. Pick one object (a candle, a dot on the wall)\n2. Hold your gaze on it softly\n3. When the mind wanders, return without frustration\n4. Do 10 minutes before work\n\nThis trains the 'return to focus' muscle, which is the actual skill you need.",
            "Can't focus? Your brain may be overstimulated. Try **5 minutes of absolute silence** — no phone, no music, eyes closed. Just sit. This clears the default mode network and makes the next 90 minutes of work feel effortless.",
        ],
        "low_mood": [
            "I'm glad you're talking to me. Low mood often comes with a quieter inner world — your EEG may be showing reduced alpha. **Loving-Kindness Meditation** is one of the most evidence-backed practices for lifting mood:\n\n1. Sit comfortably and breathe\n2. Silently: 'May I be happy. May I be well. May I be at peace.'\n3. Gradually extend this to others\n\nEven 10 minutes shifts brain chemistry measurably.",
            "That heaviness you feel is real, and you don't have to push through it alone. One gentle thing you can do right now: **place both hands on your heart and take 3 slow breaths**. It sounds simple, but it activates the caregiving system in your brain — the same one activated by a hug.",
            "Low mood and the brain's default state of 'threat scanning' are deeply linked. **Gratitude journaling** — just 3 things per day — has been shown in RCTs to shift mood within 2 weeks by retraining what the brain notices. Want to try one right now? Tell me one thing, however small, that went okay today.",
        ],
        "physical_tension": [
            "Physical tension and mental state are a two-way street — your EEG stress patterns often show up in the body first. Try **Progressive Muscle Relaxation**:\n\n1. Starting with your feet, tense each muscle group for 5 seconds\n2. Release suddenly and notice the warmth\n3. Work upward through calves, thighs, abdomen, chest, shoulders, face\n\nThe contrast between tension and release is remarkably effective.",
            "For neck and shoulder tension specifically: **Neck rolls + box breathing together**. Roll your head slowly left, chin to chest, right — one full rotation per breath cycle. Do 5 rotations. The combined effect of movement and breath signals the nervous system to release the held tension.",
        ],
        "work_stress": [
            "Work stress is often a combination of cognitive overload and loss of control. Before anything else: **write down every open task on your mind** — brain dump, no filter. Externalising it reduces the cognitive load immediately. Then we can work on the anxiety that remains.",
            "Your EEG stress signature is real, and work is often the trigger. The most effective 5-minute intervention at a desk: **push your feet hard into the floor, press your palms flat on the desk, and take 5 slow breaths**. The physical grounding interrupts the cortisol loop.",
            "Deadlines trigger the same stress response as physical danger — your body doesn't know the difference. **Box Breathing** (5 min) before a stressful meeting or task has been shown to lower cortisol by up to 23%. Try it before your next challenging moment.",
        ],
        "relationships": [
            "Relationship stress is some of the most emotionally taxing there is — it hits the attachment system, which is primal. If you're feeling disconnected or hurt, **Loving-Kindness Meditation** can help — not by fixing the situation, but by softening the pain you carry. Want me to guide you through it?",
            "Loneliness and conflict both activate the same pain centres in the brain as physical injury. One thing that helps: **self-compassion practice**. Place your hands on your heart and say: 'This is hard. Other people feel this too. May I be kind to myself right now.' It sounds simple, but it works.",
        ],
        "beginner": [
            "Perfect — everyone starts somewhere. My one rule for beginners: **start with 5 minutes, not 20**. Trying to do too much too soon is why most people quit. Here's the simplest possible start:\n\n1. Sit comfortably, close your eyes\n2. Count your breaths from 1 to 10\n3. When you lose count, start from 1 again\n4. Do this for 5 minutes\n\nThat's it. That's real meditation.",
            "The #1 beginner mistake is thinking you're 'doing it wrong' when thoughts appear. Thoughts are normal — **returning to the breath is the practice**, not the absence of thoughts. Each time you notice you've wandered and come back, that's a rep. You're building the focus muscle.",
        ],
        "duration": [
            "Research shows meaningful benefits start at **8–12 minutes per day**, practiced consistently. 20 minutes is the sweet spot for deep states. But honestly? A consistent 5 minutes beats an occasional 30 minutes every time. Start where you are.",
            f"For beginners: 5–10 minutes daily. For experienced practitioners: 20–40 minutes. For your current **{state}** state, **{r0['name']}** is designed for {r0['duration']} — which is ideal right now.",
            "Frequency matters more than duration. Daily 10-minute sessions produce more neurological change than weekly 1-hour sessions. Your brain rewires through repetition, not intensity.",
        ],
        "why_meditation": [
            "The science is solid. Regular meditation **physically thickens the prefrontal cortex** (decision-making, emotional regulation) and **shrinks the amygdala** (fear/stress response). An 8-week MBSR programme produces measurable brain changes visible on MRI — and your EEG is literally measuring those same electrical patterns.",
            "Meditation works because it trains the **'return to focus' muscle** — every time you notice you've wandered and come back, you're doing a neural rep. Over time, this makes you more resilient to stress, less reactive, and better at sustained attention. The research base is now thousands of RCTs strong.",
            "Your EEG is actually live evidence that it works. When you meditate regularly, alpha waves (relaxed focus) increase and beta waves (stress) decrease — exactly the shift we'd aim to see in your readings. The brain is plastic; it changes based on what you repeatedly do.",
        ],
        "discouraged": [
            "Feeling like it's not working is incredibly common — and it's usually a sign you're doing it right but haven't hit the threshold yet. Most people feel a difference **after 2 weeks of daily practice**, not after one session. Your brain literally needs time to grow new neural pathways.",
            "The mind resisting meditation is exactly why you need it. That restlessness, that 'this is pointless' feeling — that's the default mode network defending its territory. Push through it for 10 more sessions and see what happens. Almost everyone who does this is glad they did.",
            "What specifically feels like it's not working? Is the mind too busy? Are you falling asleep? Feeling anxious during the session? Each of those has a different fix — tell me more and I'll adjust the recommendation.",
        ],
        "eeg_explanation": [
            f"EEG (electroencephalography) measures your brain's electrical activity across five frequency bands:\n\n• **Delta (0.5–4 Hz)** — Deep sleep & restoration\n• **Theta (4–8 Hz)** — Creativity, intuition, light trance\n• **Alpha (8–13 Hz)** — Calm, relaxed, eyes-closed focus\n• **Beta (13–30 Hz)** — Active thinking (elevated = stress/anxiety)\n• **Gamma (30–100 Hz)** — Peak performance & insight\n\nYour scan: Delta {bp.get('delta','?')} | Theta {bp.get('theta','?')} | Alpha {bp.get('alpha','?')} | Beta {bp.get('beta','?')} | Gamma {bp.get('gamma','?')} µV²/Hz\nDominant: **{info['dominant_wave']}** → classified as **{state}**",
            f"The headset picks up tiny voltage changes (microvolts) from your scalp and decomposes the signal into frequency bands using FFT (Fast Fourier Transform). Your dominant band right now is **{info['dominant_wave']}** at the highest relative power, which is how I classified your state as **{state}**.",
        ],
        "gratitude": [
            "You're very welcome! The beautiful thing is — your brain is actually changing each time you practice. Come back any time for another scan. 💙",
            "That means a lot. Even this short conversation has your brain processing things differently. Keep going — consistency is everything. 💙",
            "So glad it helped. Remember: the hardest part is starting. You've already done that. 💙",
        ],
        "default": [
            f"That's a great question. With your **{state}** brainwave pattern right now, I'd approach it through a mindfulness lens — {info['description'].lower()} often responds well to **{r0['name']}**. What specifically would you like help with?",
            f"I'm here for whatever you need. Right now your EEG is showing a **{state}** state, and I have techniques tailored for exactly that. Are you looking for something quick (under 5 min), or do you have time for a deeper practice?",
            f"Tell me more — I want to give you the most useful answer. Meanwhile, note that your current **{state}** state ({info['dominant_wave']} dominant) suggests **{r0['name']}** would be particularly effective for you right now.",
        ],
    }

    templates = bank.get(intent, bank["default"])
    return random.choice(templates)


def _suggestions_for(state: str, intent: str) -> list:
    # After physical exercise → offer breathing + meditation alternatives
    if intent == "physical_exercise":
        return ["Breathing exercise", "Guide me through meditation", "Explain my EEG", "More exercises"]

    # After breathing → offer physical + meditation
    if intent == "breathing":
        return ["Physical exercises", "Guide me through meditation", "Why does breathing work?", "Another technique"]

    # After meditation recommendation or start session → offer physical + breathing
    if intent in ("recommendation", "start_session", "more_options"):
        return ["Physical exercises", "Breathing exercise", "Why does meditation work?", "Another meditation"]

    # After greeting → give a clear starting set for the state
    state_start = {
        "stressed":  ["Physical exercises for stress", "Breathing exercise", "Guide me through meditation", "Explain my EEG"],
        "anxious":   ["Physical exercises for anxiety", "Breathing exercise", "Grounding meditation", "Explain my EEG"],
        "relaxed":   ["Physical exercises", "Breathing exercise", "Deepen my meditation", "Explain my EEG"],
        "focused":   ["Physical exercises for focus", "Breathing exercise", "Visualisation guide", "Explain my EEG"],
        "drowsy":    ["Physical exercises to wake up", "Energising breath", "Start Yoga Nidra", "Explain my EEG"],
        "calm":      ["Physical exercises", "Breathing exercise", "Deep meditation guide", "Explain my EEG"],
    }
    if intent in ("greeting", "state_inquiry"):
        return state_start.get(state, ["Physical exercises", "Breathing exercise", "Meditation guide", "Explain my EEG"])

    # Specific intent overrides
    intent_overrides = {
        "sleep":       ["Start Yoga Nidra", "Body scan for sleep", "Physical exercises to wake up", "Breathing for sleep"],
        "anxiety":     ["Physical exercises for anxiety", "Breathing for panic", "What causes anxiety?", "Grounding meditation"],
        "stress":      ["Physical exercises for stress", "Box Breathing guide", "Why am I stressed?", "Meditation for stress"],
        "focus":       ["Physical exercises for focus", "Breathing for focus", "Visualisation guide", "Explain my EEG"],
        "discouraged": ["Why does it take time?", "Shorter technique (5 min)", "Physical exercises instead", "Try again"],
        "beginner":    ["Start first meditation", "Breathing exercise", "Physical exercises", "How long to meditate?"],
        "eeg_explanation": ["Physical exercises", "Breathing exercise", "Meditation for my state", "More options"],
    }
    return intent_overrides.get(intent, ["Physical exercises", "Breathing exercise", "Meditation guide", "Explain my EEG"])


# ─── Models ───────────────────────────────────────────────────────────────────

class FeaturesInput(BaseModel):
    features: list[float]


class HistoryItem(BaseModel):
    role: str   # "user" | "bot"
    text: str


class ChatMessage(BaseModel):
    message: str
    mental_state: str
    band_powers: Optional[dict] = {}
    context: Optional[List[HistoryItem]] = []


class GeneralChatMessage(BaseModel):
    message: str
    context: Optional[List[HistoryItem]] = []


class RawEEGInput(BaseModel):
    # shape: [n_samples][n_channels] — Muse 2/S sends 4 channels at 256 Hz
    samples: list[list[float]]
    sample_rate: int = 256


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "ok", "service": "neurotherapy-ai", "claude_enabled": _claude is not None}


@app.post("/analyze-features")
def analyze_features(body: FeaturesInput):
    return {
        "received_count": len(body.features),
        "prediction": "neutral",
        "confidence": 0.91,
        "label": 0,
        "message": "Legacy endpoint — use /eeg/simulate for full pipeline.",
    }


@app.post("/eeg/process-raw")
def process_raw_eeg(body: RawEEGInput):
    """
    Receive raw EEG samples from a Muse 2/S device (µV, 256 Hz, 4 channels),
    extract band powers via Welch PSD, classify mental state, and return the
    same response shape as /eeg/simulate so the frontend works unchanged.
    """
    arr = np.nan_to_num(np.array(body.samples, dtype=float))  # [n_samples, n_channels]
    sr = body.sample_rate
    n_ch = arr.shape[1]
    nperseg = min(256, arr.shape[0])

    band_ranges = {
        "delta": (0.5, 4.0),
        "theta": (4.0, 8.0),
        "alpha": (8.0, 13.0),
        "beta":  (13.0, 30.0),
        "gamma": (30.0, 45.0),
    }

    raw_bp: dict[str, float] = {}
    for band, (lo, hi) in band_ranges.items():
        ch_powers = []
        for ch in range(n_ch):
            freqs, psd = scipy_welch(arr[:, ch], fs=sr, nperseg=nperseg, average="mean")
            mask = (freqs >= lo) & (freqs < hi)
            ch_powers.append(float(psd[mask].mean()) if mask.any() else 0.0)
        raw_bp[band] = float(np.mean(ch_powers))

    # Normalise to display range (≤15 µV²/Hz) while preserving inter-band ratios
    max_val = max(raw_bp.values()) or 1.0
    band_powers = {k: round(v * 15.0 / max_val, 3) for k, v in raw_bp.items()}

    state = classify_state(band_powers)

    # Build a signal preview from channel 0 (TP9), centred around 4096 for UI compat
    raw_ch0 = arr[:60, 0] if arr.shape[0] >= 60 else arr[:, 0]
    ch_mean = float(raw_ch0.mean())
    ch_range = float(raw_ch0.max() - raw_ch0.min()) or 1.0
    signal_data = [
        {"t": i, "v": round(4096.0 + (float(v) - ch_mean) / ch_range * 200.0, 1)}
        for i, v in enumerate(raw_ch0)
    ]

    # Channel labels for Muse 2/S (4-channel)
    muse_channels = ["TP9", "AF7", "AF8", "TP10"]
    channels = {muse_channels[i]: round(float(arr[-1, i]), 2) for i in range(n_ch)}

    return {
        "dataset": "Muse 2 · Live Device",
        "subject_id": None,
        "session": 1,
        "channels": channels,
        "band_powers": band_powers,
        "mental_state": state,
        "original_label": state,
        "signal_preview": signal_data,
        "state_info": MENTAL_STATE_INFO[state],
        "source": "live_device",
    }


@app.get("/eeg/simulate")
def simulate_eeg(subject_id: Optional[int] = None):
    """Return a randomised EEG sample modelled on alexispomares/dissertation-raw."""
    pool = ([s for s in DATASET_SAMPLES if s["subject_id"] == subject_id]
            if subject_id and 1 <= subject_id <= 5
            else DATASET_SAMPLES)

    sample = random.choice(pool)
    rng = np.random.default_rng()

    band_powers = {
        "delta": round(float(max(0.1, sample["delta"] + rng.normal(0, 0.3))), 3),
        "theta": round(float(max(0.1, sample["theta"] + rng.normal(0, 0.4))), 3),
        "alpha": round(float(max(0.1, sample["alpha"] + rng.normal(0, 0.5))), 3),
        "beta":  round(float(max(0.1, sample["beta"]  + rng.normal(0, 0.6))), 3),
        "gamma": round(float(max(0.1, sample["gamma"] + rng.normal(0, 0.3))), 3),
    }
    channels = {ch: round(float(4096 + rng.normal(0, 150)), 2) for ch in EEG_CHANNELS}

    t = np.linspace(0, 4 * np.pi, 60)
    signal = (4096 + 80 * np.sin(t) + 40 * np.sin(3 * t) + 20 * np.sin(7 * t) + rng.normal(0, 30, 60))
    signal_data = [{"t": i, "v": round(float(v), 1)} for i, v in enumerate(signal)]

    state = classify_state(band_powers)
    return {
        "dataset": "alexispomares/dissertation-raw",
        "subject_id": sample["subject_id"],
        "session":    sample["session"],
        "channels":   channels,
        "band_powers": band_powers,
        "mental_state": state,
        "original_label": sample["label"],
        "signal_preview": signal_data,
        "state_info": MENTAL_STATE_INFO[state],
    }


def _call_claude_general(message: str, history: list) -> str:
    system = """You are Neuro AI, a warm and empathetic AI mental wellness companion.

The user is describing their current mental state and condition directly — there is no EEG scan. Listen carefully to what they share and respond accordingly.

RULES:
- Be warm, conversational, and empathetic — a knowledgeable friend, not a clinical tool
- Ask gentle clarifying questions if needed to understand their state
- Provide personalized meditation, breathing exercises, or physical exercises based on what they tell you
- Keep replies concise (2–4 sentences) unless the user asks for step-by-step instructions
- For technique guides, number each step clearly
- Answer any question about: meditation, mindfulness, breathing, sleep, stress, anxiety, focus, CBT, neuroplasticity, emotional regulation, mental health habits
- For off-topic questions, gently redirect: "That's a bit outside my area — I focus on mental wellness..."
- Use **bold** only for technique names, never for random emphasis
- Use at most 1 emoji per message, only when natural
- Vary your opening words — never start two consecutive replies the same way
- If the user expresses thoughts of self-harm, compassionately encourage professional help"""

    msgs = []
    for h in history:
        role = "user" if h.get("role") == "user" else "assistant"
        msgs.append({"role": role, "content": h.get("text", "")})
    msgs.append({"role": "user", "content": message})

    resp = _claude.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=450,
        system=system,
        messages=msgs,
    )
    return resp.content[0].text


def _general_fallback(intent: str) -> str:
    bank = {
        "greeting": [
            "Hi! I'm your AI wellness guide. Tell me how you're feeling — stressed, anxious, tired, lazy, in pain, or just wanting to feel better — and I'll give you specific techniques for meditation, breathing, exercise, sleep, or nutrition. 💙",
            "Welcome! Describe what's going on — your mood, energy, any physical symptoms, or mental challenges — and I'll tailor a health and wellness recommendation just for you.",
            "Hello! I can help with stress, anxiety, low energy, sleep problems, focus, body pain, nutrition, motivation, and much more. What are you dealing with today?",
        ],
        "low_energy": [
            "Feeling lazy or low-energy is often a mix of physical and mental signals. Here's how to reset:\n\n**Immediate energy boosters:**\n1. **Cold water splash** — cold water on face and wrists for 30 seconds. Triggers alertness instantly\n2. **20 jumping jacks** — gets blood and oxygen moving within 60 seconds\n3. **Kapalabhati breathing** — rapid forceful exhales through nose, 30 cycles. Spikes adrenaline naturally\n4. **5 minutes of sunlight** — steps outside. Light resets the circadian clock\n5. **Hydrate** — dehydration is the most overlooked cause of low energy. Drink 500ml water now\n\n**Longer-term fixes:** regular sleep schedule, reducing sugar, 20-minute walks daily, B12 and iron levels checked if this is chronic.",
            "Low energy and laziness often have specific causes. Let's figure out yours:\n\n- **Physical tiredness** → you need rest, Yoga Nidra, or sleep improvement\n- **Mental fatigue** → you need a mental break, nature walk, or dopamine reset\n- **Motivational slump** → you need a small win, a 2-minute task, or a purpose reconnection\n- **Nutritional** → you may be low in iron, B12, or Vitamin D\n\nThe fastest general fix: **cold water + 10 minutes of brisk walking + 500ml water**. This combination shifts your brain chemistry within 15 minutes. Which type resonates most with you?",
            "Here are proven techniques to beat low energy and laziness:\n\n1. **The 2-minute rule** — commit to just 2 minutes of any task. Your brain almost always continues past 2 minutes once started (this beats procrastination too)\n2. **Power nap** — 10–20 minutes (not more — more causes grogginess). Set an alarm\n3. **Energising breath** — rapid inhales-exhales through nose for 30 cycles, then 3 deep slow breaths\n4. **Cold shower** — 30 seconds of cold at end of your normal shower. Proven to increase alertness for 4+ hours\n5. **Move your body** — even 5 minutes of movement spikes dopamine and norepinephrine\n\nIf low energy is persistent (weeks), it may signal iron deficiency, thyroid issues, or poor sleep quality — worth checking with a doctor.",
        ],
        "breathing": [
            "**Box Breathing** (used by military, surgeons, and athletes):\n\n1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold empty for 4 counts\n\nRepeat 4–6 cycles. Activates the parasympathetic nervous system within 90 seconds. Use it before high-pressure situations, during panic, or whenever you feel overwhelmed.",
            "**4-7-8 Breathing** — the fastest natural relaxation technique:\n\n1. Exhale completely through your mouth\n2. Inhale through nose for 4 counts\n3. Hold for 7 counts\n4. Exhale through mouth for 8 counts\n\nDo 4 cycles. The extended exhale activates your vagus nerve — your body's built-in calm switch. Most people feel significantly calmer within 3 minutes.",
            "**Diaphragmatic (belly) breathing** — the foundation of stress relief:\n\n1. Place one hand on chest, one on belly\n2. Breathe so only the belly hand rises (chest stays still)\n3. Inhale for 4 counts, exhale for 6\n4. Continue for 5 minutes\n\nLonger exhales lower cortisol. This is the breathing pattern of deep sleep — you're teaching your nervous system that you're safe.",
        ],
        "physical_exercise": [
            "Here are exercises matched to mental and physical wellness:\n\n**For energy and mood:**\n1. **20-minute brisk walk** — the most research-backed mood booster\n2. **10 jumping jacks + 10 squats + 10 push-ups** (3 rounds) — takes 8 minutes, spikes dopamine\n3. **Sun salutation** (yoga flow) — 5 rounds, 10 minutes\n\n**For stress and tension:**\n1. **Progressive muscle relaxation** — tense and release each muscle group\n2. **Forward fold** — hang arms and head down, hold 60 seconds\n3. **Neck rolls** — slow circles left and right, 5 each\n\n**For focus:**\n1. **7-minute HIIT circuit** — high intensity for 7 minutes before a work session\n2. **Yoga warrior poses** — held for 30 seconds each side\n\nWhat's your goal — energy, stress relief, or focus?",
            "Physical movement is the most powerful mental health intervention we have. Here's a complete daily routine:\n\n**Morning (10 min):** 5 sun salutations → 1-minute cold shower → 500ml water\n**Midday (5 min):** Brisk walk or 3 rounds of squat/push-up/plank\n**Evening (15 min):** Yoga stretches (hips, hamstrings, chest, shoulders) → body scan meditation\n\nEven one of these makes a measurable difference. Which time of day works best for you?",
        ],
        "sleep": [
            "Poor sleep is often about the hour BEFORE bed, not when you get into bed. Here's a full sleep protocol:\n\n**Wind-down routine (1 hour before):**\n1. No screens (phone, TV) — blue light suppresses melatonin\n2. Lower room temperature to 18–20°C (the brain needs to cool to sleep)\n3. **4-7-8 breathing** × 4 cycles\n4. Write down tomorrow's tasks (clears the mental RAM)\n\n**In bed:**\n5. **Body scan meditation** — slowly scan from head to feet, releasing tension\n6. **Military sleep method** — relax face muscles, drop shoulders, exhale and relax chest, then legs\n\n*Most sleep problems are solved by consistency — same sleep/wake time every day, even weekends.*",
            "**Yoga Nidra (NSDR)** is the most effective sleep technique:\n\n1. Lie flat on your back (savasana)\n2. Rotate awareness through body parts — feel each part without moving it\n3. Visualise pairs of opposites (heavy/light, warm/cool)\n4. Rest in the hypnagogic state between waking and sleep\n\n30 minutes of Yoga Nidra = approximately 2 hours of deep sleep, according to research. It's used by surgeons before complex operations.\n\nFor insomnia: the most evidence-backed treatment is **CBT-I (Cognitive Behavioural Therapy for Insomnia)** — I can walk you through the core techniques if you'd like.",
            "Here are the top sleep tips backed by sleep science:\n\n1. **Consistent schedule** — same bedtime/wake time daily (most important factor)\n2. **No caffeine after 2pm** — caffeine has a 6-hour half-life\n3. **Morning sunlight** — 10 minutes outside within 1 hour of waking sets circadian rhythm\n4. **Cold room** — 18°C is optimal for sleep onset\n5. **Magnesium glycinate** — the most sleep-supportive supplement (400mg before bed)\n6. **4-7-8 breathing** in bed\n7. **Avoid alcohol** — it fragments sleep architecture even if you fall asleep faster\n\nWhich of these are you already doing?",
        ],
        "anxiety": [
            "Anxiety is your brain's alarm system being triggered when there's no actual danger. Here are the most effective interventions:\n\n**Immediate (right now):**\n• **5-4-3-2-1 Grounding:** Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste\n• **Cold water on face** — activates the dive reflex, drops heart rate within 30 seconds\n• **Box breathing** × 6 cycles\n\n**For recurring anxiety:**\n• **Journaling** — write the anxious thought, then write evidence for and against it (CBT technique)\n• **Physical exercise** — 20 minutes reduces anxiety as effectively as medication in studies\n• **Limiting caffeine and alcohol** — both significantly worsen anxiety\n\nIs your anxiety more physical (racing heart, tight chest) or mental (racing thoughts, worst-case scenarios)?",
            "Anxiety feels different from stress — it's often future-focused fear rather than present-moment pressure. The fastest reset:\n\n1. **STOP technique:** Stop. Take a breath. Observe what you're feeling without judging it. Proceed with intention\n2. **Physiological sigh:** Double inhale through nose (sniff twice), long slow exhale through mouth. This is the fastest way to reduce physiological arousal\n3. **Name it to tame it:** Say out loud 'I notice I'm feeling anxious' — labelling reduces amygdala activation\n4. **Move your body** — anxiety is energy that needs somewhere to go. Walk, shake, dance\n\nFor panic attacks specifically: focus on the exhale, not the inhale. Keep exhales longer than inhales.",
        ],
        "stress": [
            "Stress lives in both the mind and the body. The fastest mind-body reset:\n\n**2-minute emergency protocol:**\n1. Stop what you're doing\n2. **Box breathe** × 4 cycles (4 counts each)\n3. **Tense every muscle** in your body for 5 seconds, then release completely\n4. Say to yourself: 'This moment will pass. I can handle this.'\n\n**15-minute deeper reset:**\n1. **Progressive Muscle Relaxation** — work from feet to face, tensing and releasing each group\n2. **Body scan meditation** — 10 minutes of non-judgemental body awareness\n3. **Journaling** — brain dump every open concern. Externalising reduces cognitive load immediately\n\nChronic stress (lasting weeks) requires lifestyle changes: sleep, exercise, social connection, and often professional support.",
            "Here's how stress actually works and how to stop it:\n\nStress triggers cortisol and adrenaline — designed for short-term survival. Problems happen when these stay elevated long-term. The antidote:\n\n1. **Movement** — metabolises stress hormones faster than anything else. Even a 10-minute walk\n2. **Extended exhale breathing** — 4 counts in, 8 counts out. Activates vagus nerve\n3. **Cold exposure** — 30 second cold shower. Raises dopamine 250% and normalises cortisol\n4. **Social connection** — talking to someone releases oxytocin, which directly blocks cortisol\n5. **Limit news and social media** — major cortisol triggers\n\nWhat's the main source of your stress right now?",
        ],
        "focus": [
            "Poor focus often has three causes: overstimulation, poor sleep, or low dopamine. Here's the fix for each:\n\n**Immediate focus boost:**\n1. **Clear your environment** — close tabs, silence phone, one task only\n2. **5 minutes of meditation** — single-point focus on breath before starting work\n3. **Cold water on face** — spikes norepinephrine (focus neurochemical)\n4. **Set a 25-minute timer** (Pomodoro) — finite time blocks make the brain commit\n\n**Brain fog / scattered thinking:**\n• Drink water first (dehydration is a major cause of brain fog)\n• 10-minute walk (increases BDNF — the brain's growth factor)\n• Check your sleep — one poor night reduces cognitive function 20–40%\n\n**Sustained focus (for studying/deep work):**\n• Work in 90-minute ultradian cycles with 20-minute breaks\n• No caffeine after 2pm\n• **Binaural beats** (40Hz gamma) in headphones while working",
            "**The science of focus:** your brain has a limited daily supply of focused attention. Here's how to use it well:\n\n1. **Do your hardest task first** — willpower and focus peak in the first 2 hours after waking\n2. **Single-tasking** — multitasking reduces IQ by 10 points per study. One task at a time\n3. **Single-Point Concentration meditation** — stare at a dot or candle flame, hold attention there. Do 10 minutes before work. Trains the return-to-focus muscle\n4. **Movement breaks** — 5-minute walk every 45–90 minutes restores prefrontal cortex function\n5. **Avoid sugar and refined carbs** — they cause energy crashes and brain fog\n\nAre you struggling to start tasks, or to maintain focus once you start?",
        ],
        "low_mood": [
            "Low mood is real and deserves real attention. Here are evidence-based approaches:\n\n**Right now:**\n1. **Place both hands on your heart and take 3 slow breaths** — activates the brain's caregiving system\n2. **Name one small thing that's okay** — shifts the brain's threat-scanning mode\n3. **Get sunlight** — 10 minutes outside. Light directly raises serotonin\n4. **Move your body** — even a 10-minute walk raises mood measurably\n\n**Ongoing:**\n• **Loving-Kindness (Metta) meditation** — clinically proven to lift mood within 2 weeks\n• **Gratitude journaling** — 3 things daily rewires the brain's negativity bias\n• **Social contact** — isolation deepens low mood. Even a short message to a friend helps\n• **Reduce alcohol** — it's a depressant that significantly worsens low mood\n\nIf this has lasted more than 2 weeks, please consider speaking to a healthcare professional — persistent low mood is treatable.",
            "One thing that's important: low mood doesn't mean something is wrong with you. It's often a signal to rest, reconnect, or change something. Here's what helps:\n\n1. **Behavioural activation** — the CBT technique of gently doing things even when you don't feel like it. Low mood kills motivation first, but action usually restores feeling\n2. **Loving-Kindness meditation** — sit, breathe, silently repeat: 'May I be happy. May I be healthy. May I be at peace.' Extend to others. 10 minutes daily\n3. **Physical exercise** — the most powerful antidepressant we know\n4. **Sleep** — poor sleep and low mood are deeply linked\n5. **Connection** — loneliness and low mood reinforce each other. Reach out to one person today\n\nWhat's been going on for you?",
        ],
        "anger": [
            "Anger is often a secondary emotion — it usually masks hurt, fear, or frustration underneath. In the moment:\n\n**Immediate anger tools:**\n1. **Leave the situation** if possible — even 2 minutes changes the physiological state\n2. **Cold water on face or wrists** — activates dive reflex, drops heart rate fast\n3. **Slow exhale breathing** — breathe out for twice as long as you breathe in (4 in, 8 out)\n4. **Physical release** — brisk walk, push-ups, or punching a pillow. Metabolises adrenaline\n5. **Count to 10** — creates a gap between stimulus and response\n\n**Longer-term anger management:**\n• **Journaling** — write what happened, how you felt, and what need was unmet\n• **Regular exercise** — dramatically reduces baseline irritability\n• **Sleep** — poor sleep is one of the biggest triggers for disproportionate anger\n• **Mindfulness practice** — creates the 'pause' between trigger and reaction over time",
            "Anger that comes quickly or intensely usually means your nervous system is already dysregulated (high cortisol, poor sleep, or accumulated stress). The fix is usually upstream:\n\n1. **Prioritise sleep** — lack of sleep literally shrinks the prefrontal cortex (impulse control)\n2. **Daily exercise** — burns off the cortisol and adrenaline that prime the anger response\n3. **Stress management** — anger is a pressure valve. Reduce total pressure and the valve triggers less\n4. **The STOP technique:** Stop → Take a breath → Observe what's underneath (hurt? fear?) → Proceed with intention\n5. **Compassion practice** — Loving-Kindness meditation reduces reactivity over time\n\nWhat tends to trigger your anger most often?",
        ],
        "headache": [
            "Headaches have different types and need different approaches:\n\n**Tension headache (most common — feels like a band around the head):**\n1. **Neck and shoulder stretches** — slowly roll head, release jaw, drop shoulders\n2. **Peppermint oil** on temples and back of neck\n3. **Cold or warm compress** on forehead/neck (experiment — both work for different people)\n4. **Drink water** — dehydration causes 60% of tension headaches\n5. **Step away from screens** — 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds\n\n**Migraine:**\n• Dark, quiet room\n• Cold compress on forehead\n• Caffeine in small amounts (constricts blood vessels)\n• Magnesium glycinate supplement (preventative for frequent migraines)\n• Identify triggers: common ones are hormones, certain foods (aged cheese, wine), bright lights, disrupted sleep\n\n**Prevention:** regular sleep, hydration, stress management, and reducing caffeine are the four pillars.",
        ],
        "body_pain": [
            "Chronic body pain often has both physical and nervous system components. Here's a comprehensive approach:\n\n**For back pain:**\n1. **Cat-cow stretch** — on hands and knees, arch and round your back slowly, 10 cycles\n2. **Child's pose** — kneel, fold forward, arms extended, hold 60 seconds\n3. **Glute bridges** — lie on back, knees bent, raise hips × 15\n4. **Strengthen your core** — most back pain comes from weak core muscles\n5. **Walking** — one of the best things for back pain. 20 minutes daily\n\n**For joint pain:**\n• **Gentle movement** (not rest) — joints need fluid movement to stay lubricated\n• **Anti-inflammatory diet** — reduce sugar, processed food, vegetable oils\n• **Omega-3** (fish oil) — potent natural anti-inflammatory\n• **Turmeric with black pepper** — curcumin is clinically effective for joint inflammation\n\n**Mind-body:** chronic pain has a significant neurological component. Mindfulness-Based Stress Reduction (MBSR) reduces chronic pain by 40–50% in studies.",
        ],
        "physical_tension": [
            "Physical tension in the body is where emotional stress goes when it has nowhere else to go. Here's how to release it:\n\n**Immediate release:**\n1. **Progressive Muscle Relaxation** — starting from feet, tense each muscle group for 5 seconds, then release. The contrast between tension and release is what releases stored stress\n2. **Neck rolls** — slow, full circles. 5 each direction\n3. **Shoulder shrugs** — raise both shoulders to ears, hold 5 seconds, drop hard × 8\n4. **Body shake** — literally shake your arms, legs, and torso for 30–60 seconds. Used in trauma therapy\n\n**For chronic tension (daily practice):**\n• **Yin yoga** — deep, long-held stretches (2–5 minutes each pose)\n• **Foam rolling** — self-massage that breaks up fascial adhesions\n• **Regular massage** — monthly reduces chronic tension significantly\n• **Box breathing before sleep** — prevents overnight tension accumulation",
        ],
        "motivation": [
            "Motivation is not a personality trait — it's a neurochemical state driven by dopamine. Here's how to work with your brain:\n\n**Why motivation disappears:**\nProcrastination is almost always avoidance of negative emotion (fear of failure, overwhelm, boredom) rather than laziness. Your brain is protecting you.\n\n**What actually works:**\n1. **The 2-minute rule** — commit to just 2 minutes. Your brain continues past 2 minutes 80% of the time\n2. **Implementation intentions** — 'I will [task] at [time] in [place]' is 2–3× more effective than 'I should do [task]'\n3. **Reduce friction** — make the desired behaviour the easiest option (gym bag ready the night before, etc.)\n4. **Reward immediately** — pair the task with something pleasurable immediately after\n5. **Identity-based habits** — 'I am someone who exercises' rather than 'I'm trying to exercise'\n\n**Dopamine reset:** avoid scrolling, sugar, and overstimulation for a few hours — this resets your dopamine baseline and makes normal activities feel rewarding again.",
            "Procrastination and lack of motivation often come down to task design, not willpower:\n\n1. **Break it down** — the task is too big. What's the smallest possible first step?\n2. **Time-box it** — commit to 25 minutes (Pomodoro). Knowing it ends reduces resistance\n3. **Environment design** — go to a different location (library, café). New environment breaks mental associations\n4. **Body first** — 10 minutes of exercise before the task spikes dopamine and focus\n5. **Connect to purpose** — ask 'why does this matter?' and write 3 reasons\n\n*Motivation follows action, not the other way around.* Start tiny and momentum builds.",
        ],
        "nutrition": [
            "Nutrition has a profound impact on mental health, energy, and focus. The basics that make the biggest difference:\n\n**Brain-supporting foods:**\n• **Omega-3** (fatty fish, walnuts, flaxseed) — reduces depression and anxiety\n• **Fermented foods** (yoghurt, kefir, kimchi) — gut health directly impacts mental health via the gut-brain axis\n• **Dark leafy greens** — magnesium for stress, folate for mood\n• **Berries** — antioxidants that reduce brain inflammation\n• **Dark chocolate (70%+)** — flavonoids, magnesium, and a small dopamine boost\n\n**What to reduce:**\n• Sugar — causes energy crashes, worsens anxiety and depression\n• Processed/ultra-processed food — inflammatory, gut-disrupting\n• Excessive caffeine — worsens anxiety and disrupts sleep\n• Alcohol — depressant that disrupts sleep architecture\n\n**Key supplements worth considering:**\n• Magnesium glycinate (sleep, anxiety)\n• Vitamin D3 (mood, immune system)\n• B12 (energy, nervous system)\n• Omega-3 fish oil\n\nWhat specific nutrition question do you have?",
        ],
        "immune_health": [
            "Immune health is strongly linked to sleep, stress, and gut health. Here's how to support your immune system:\n\n**The foundations:**\n1. **Sleep 7–9 hours** — during sleep your immune system makes cytokines and T-cells. One poor sleep night reduces immune function by 30%\n2. **Manage stress** — chronic stress suppresses the immune system via cortisol\n3. **Exercise regularly** — moderate exercise (not extreme) boosts immune surveillance\n4. **Eat whole foods** — especially colourful vegetables, fruits, fermented foods\n\n**Evidence-based immune boosters:**\n• **Vitamin D3** (most people are deficient) — directly regulates immune response\n• **Zinc** — shortens illness duration when taken at onset\n• **Vitamin C** — supports immune cell function (food sources better than supplements)\n• **Elderberry** — reduces cold duration in studies\n• **Probiotics** — 70% of immune system is in the gut\n\n**When you feel illness coming on:**\n• Rest immediately — fight the urge to push through\n• Increase fluids and sleep\n• Garlic (allicin is antimicrobial), ginger (anti-inflammatory), honey with warm water",
        ],
        "self_esteem": [
            "Low self-esteem is one of the most common and most treatable issues in mental health. Here's what actually works:\n\n**The science:** self-esteem is not fixed — it's a habit of thought and a set of behaviours. You can change both.\n\n**Practical approaches:**\n1. **Self-compassion practice** — treat yourself the way you'd treat a good friend. When you make a mistake, say 'This is hard. Other people feel this too. May I be kind to myself.' (Kristin Neff's research shows this works better than self-esteem affirmations)\n2. **Competence building** — self-esteem grows from doing hard things. Small daily challenges add up\n3. **Values clarification** — self-esteem based on external validation is fragile. Based on your own values, it's stable\n4. **Cognitive reframing** — challenge the inner critic. Is the thought true? Would you say it to a friend?\n5. **Body movement** — posture, exercise, and how you carry yourself change how you feel about yourself\n\nWhat area of self-worth are you struggling with most?",
        ],
        "grief": [
            "Grief is not a problem to be solved — it's the natural response to love. There's no right way or right timeline. What helps:\n\n**Allowing the process:**\n• Give yourself permission to feel all of it — sadness, anger, numbness, even moments of happiness (these are all normal)\n• Grief is not linear. The Kübler-Ross stages (denial, anger, bargaining, depression, acceptance) happen in any order, many times\n\n**Practical support:**\n1. **Don't isolate** — grief is harder alone. Reach out, even when it feels pointless\n2. **Routine** — maintaining basic structure (eating, sleeping, moving) keeps the nervous system anchored\n3. **Grief journaling** — write about the person, write to them, write about what you miss\n4. **Loving-Kindness meditation** — extend compassion first to yourself, then to the person you've lost\n5. **Physical movement** — grief is stored in the body. Gentle movement helps process it\n\nIf you're struggling with complicated grief, a grief-specialised therapist makes a significant difference. You don't have to carry this alone. 💙",
        ],
        "addiction": [
            "Breaking habits and addictions is hard because they involve real neurological changes in the brain's reward system. What actually works:\n\n**Understanding it:** addiction is the brain's dopamine system getting hijacked. The substance/behaviour provides a dopamine hit the brain starts to rely on. Removing it creates withdrawal — real physiological discomfort.\n\n**Evidence-based approaches:**\n1. **Replace, don't just remove** — identify what need the habit meets (stress relief, boredom, social connection) and replace it with a healthier behaviour that meets the same need\n2. **Urge surfing** — when a craving hits, observe it without acting. Cravings peak at 3–5 minutes then drop. Surf the wave\n3. **Environment design** — remove the cue (no cigarettes at home, delete the app, etc.)\n4. **Delay and distract** — commit to waiting 10 minutes and doing something physical. Most cravings pass\n5. **Social support** — telling someone you trust significantly improves success rates\n\nFor alcohol, nicotine, or substance use disorder, professional support (including medication) makes a dramatic difference. There's no shame in getting help.",
        ],
        "mindfulness": [
            "Mindfulness is the practice of paying attention to the present moment without judgement. It's one of the most researched wellness interventions:\n\n**Core practice — Breath Awareness:**\n1. Sit comfortably and close your eyes\n2. Focus on the physical sensation of breathing — the air at your nostrils, or the rise and fall of your chest\n3. When your mind wanders (it will — this is normal), gently notice and return\n4. The 'noticing and returning' IS the practice. Each return builds the focus muscle\n\nStart with 5 minutes daily. Research shows structural brain changes after 8 weeks of consistent practice.\n\n**Informal mindfulness:**\n• Mindful eating — taste every bite, eat slowly\n• Mindful walking — feel every footfall, notice surroundings\n• Mindful conversations — full presence, no phone\n\n**Apps:** Insight Timer (free), Headspace, or Calm for guided sessions.",
        ],
        "posture": [
            "Poor posture affects mood, energy, confidence, and physical health. Here's a complete fix:\n\n**The problem:** sitting rounds the spine, tightens hip flexors, weakens glutes and core, and compresses the chest — which literally restricts breathing and can cause anxiety.\n\n**Immediate fixes:**\n1. **Screen at eye level** — top of screen at eye height\n2. **Chair height** — feet flat, knees at 90 degrees, back supported\n3. **Every 30 minutes:** stand, roll shoulders back, do 10 squats\n\n**Daily posture routine (10 min):**\n1. **Chest opener** — clasp hands behind back, squeeze shoulder blades, look up, hold 30 seconds\n2. **Hip flexor stretch** — lunge position, drop back knee, lean forward, hold 60 seconds each side\n3. **Cat-cow** — 10 slow cycles\n4. **Wall angels** — stand against wall, slide arms up and down like a snow angel × 10\n\n**Long-term:** strengthen glutes, core, and mid-back. Yoga and Pilates are excellent for this.",
        ],
        "relationships": [
            "Relationship stress is some of the most emotionally draining there is — it hits the primal need for connection and safety. Here's what helps:\n\n**When in conflict:**\n1. **Take a break** — if you're flooded (heart rate >100), you physically can't have a productive conversation. Agree to pause for 20 minutes\n2. **Slow breathing** — reduces physiological arousal so the thinking brain comes back online\n3. **I-statements** — 'I feel hurt when...' rather than 'You always...'\n4. **Repair attempts** — reaching out after conflict is a skill that predicts relationship success more than conflict frequency\n\n**For loneliness:**\n• Reach out to one person today — even a text\n• Join a class, group, or community (shared activity is the fastest way to build connection)\n• **Loving-Kindness meditation** reduces feelings of isolation and loneliness measurably\n\n**For general relationship stress:** journaling about your feelings before speaking helps you understand what you actually need.",
        ],
        "work_stress": [
            "Work stress often comes from a combination of cognitive overload, lack of control, and unclear boundaries. Here's a tactical approach:\n\n**Immediate (at desk):**\n1. **Brain dump** — write every open task/concern. Externalising reduces cognitive load instantly\n2. **Feet on floor, palms on desk, 5 slow breaths** — grounds the nervous system mid-workday\n3. **Priority matrix** — what's urgent AND important vs. just urgent? Do those first\n4. **Box breathing** before a stressful meeting\n\n**End-of-day ritual (essential for recovery):**\n• Close laptop, write tomorrow's top 3 tasks, say 'shut down complete'\n• 10-minute walk to transition from work mode\n• No work email/messages after a set time\n\n**Long-term burnout prevention:**\n• Protect one 2-hour deep work block daily (no meetings)\n• Exercise 3× per week — reduces work stress more than any other habit\n• Say no to non-essential commitments\n• If burnout is severe, it may require medical leave — burnout is a recognised medical condition",
        ],
        "beginner": [
            "Perfect place to start. The biggest beginner mistake is aiming too high — people try 20-minute meditation sessions and quit because they can't sit still. Start tiny:\n\n**Your first week:**\n- **Day 1–3:** Just 3 minutes of breath counting. Sit, close eyes, count breaths 1–10, repeat\n- **Day 4–5:** 5 minutes of box breathing (4-4-4-4 counts)\n- **Day 6–7:** 5 minutes of body scan — lie down, scan from head to feet, notice sensations\n\n**The golden rule:** you haven't 'failed' when thoughts appear. Thoughts always appear. The practice IS noticing you've wandered and coming back. That's the exercise. Every return is a rep.\n\nAfter 1 week of this, you'll notice a real difference in how quickly you can calm yourself down in stressful moments.",
        ],
        "duration": [
            "Research shows meaningful benefits from meditation and breathwork start at:\n• **8–12 minutes per day** — measurable mood and focus improvement\n• **20 minutes per day** — the sweet spot for deep states and neuroplasticity\n• **8 weeks of daily practice** — structural brain changes visible on MRI\n\nBut consistency beats duration every time. A daily 5-minute practice beats a weekly 45-minute session for neurological rewiring.\n\nFor exercise: **150 minutes per week** of moderate activity (WHO guideline) is the threshold for mental health benefits — that's just 22 minutes daily.",
        ],
        "why_meditation": [
            "The science is solid and fascinating:\n\n**What meditation physically does to the brain:**\n• Thickens the **prefrontal cortex** (decision-making, impulse control, emotional regulation)\n• Shrinks the **amygdala** (the brain's threat/fear centre)\n• Increases **grey matter density** in areas associated with self-awareness and compassion\n• Reduces **default mode network activity** (the mind-wandering 'me' thoughts linked to depression)\n\nThese changes are visible on MRI after just 8 weeks of daily practice.\n\n**Breathing works** by directly controlling the autonomic nervous system — specifically, extended exhales activate the parasympathetic ('rest and digest') branch, lowering heart rate, cortisol, and muscle tension.\n\n**Exercise works** by releasing BDNF (brain-derived neurotrophic factor) — essentially fertiliser for neurons — and raising serotonin, dopamine, and norepinephrine simultaneously.",
        ],
        "discouraged": [
            "Feeling like it's not working is incredibly common — and it's usually a sign you're doing it right but haven't hit the threshold yet. Most people feel a difference after **2 weeks of daily practice**, not after one session.\n\nYour brain literally needs time to grow new neural pathways. Think of it like going to the gym — one session doesn't build muscle, but two weeks of daily sessions creates measurable change.\n\nThe mind resisting meditation is exactly why you need it. That restlessness, that 'this is pointless' feeling — that's the default mode network defending its territory.\n\nWhat specifically feels like it's not working? Is your mind too busy? Are you falling asleep? Feeling anxious during the session? Each of those has a different fix.",
        ],
        "gratitude": [
            "You're very welcome! Remember: consistency is everything with these practices. Even 5–10 minutes daily makes a measurable difference within 2 weeks. Come back any time you need support. 💙",
            "So glad that helped! The research is clear — every session counts, even the imperfect ones. Keep going. 💙",
        ],
        "recommendation": [
            "Based on what you've shared, here's my recommendation:\n\n**Start with:** 5 minutes of **Box Breathing** (4 counts in, hold, out, hold) — this works for almost any mental state and takes effect within 2 minutes.\n\n**Then:** A 10-minute **Body Scan Meditation** — lie down, close eyes, slowly scan from head to feet noticing sensations without judging them.\n\n**For your body:** a 15-minute gentle walk outside. The combination of movement, sunlight, and breathing in fresh air is the most research-backed mood intervention we have.\n\nTell me more about specifically how you're feeling and I can give you a more targeted recommendation.",
        ],
        "start_session": [
            "Let's begin right now. 🧘 Find a comfortable seated or lying position.\n\n**5-minute Breath Awareness Meditation:**\n\n1. Close your eyes and take 3 deep breaths to settle in\n2. Let your breath return to its natural rhythm — don't control it, just observe it\n3. Notice the air entering at your nostrils, the brief pause, the release\n4. When a thought appears (and they will), simply notice: 'thinking' — and gently return to the breath\n5. There's nowhere to get to. Just this breath. Then this one. Then this one.\n\nSet a timer for 5 minutes. When it rings, slowly open your eyes and take 30 seconds before moving. 💙",
        ],
        "more_options": [
            "Here's a different approach you might not have tried:\n\n**Loving-Kindness (Metta) Meditation:**\n1. Sit comfortably and close your eyes\n2. Bring yourself to mind and silently repeat: 'May I be happy. May I be healthy. May I be at peace.'\n3. Gradually extend this wish to someone you love, then a neutral person, then a difficult person\n4. Finally extend it to all beings\n\nThis practice has the most research backing for reducing depression, anxiety, loneliness, and interpersonal conflict — and most people find it surprisingly moving even the first time.",
        ],
        "eeg_explanation": [
            "EEG (electroencephalography) measures your brain's electrical activity across five frequency bands:\n\n• **Delta (0.5–4 Hz)** — Deep sleep and physical restoration\n• **Theta (4–8 Hz)** — Creativity, intuition, light trance, drowsiness\n• **Alpha (8–13 Hz)** — Calm, relaxed, eyes-closed alertness\n• **Beta (13–30 Hz)** — Active thinking, concentration (elevated = stress/anxiety)\n• **Gamma (30–100 Hz)** — Peak performance, insight, intense focus\n\nThe NeuroTherapy app analyses your dominant band to classify your mental state and match you with the most effective techniques for that state.",
        ],
        "default": [
            "I can help with a wide range of health and wellness topics — stress, anxiety, low energy, sleep, focus, body pain, nutrition, motivation, relationships, anger, and more. Just describe what you're experiencing and I'll give you specific, actionable advice.\n\nWhat's going on for you right now?",
            "Tell me more about how you're feeling — physically or mentally. For example: 'I feel tired and unmotivated', 'I have a lot of stress from work', 'I can't sleep', 'I feel anxious', 'I have low energy', 'I have back pain'. The more specific you are, the better I can help.",
            "I'm here to help with your health and wellbeing. I cover: meditation, breathing techniques, physical exercise, sleep improvement, stress and anxiety management, nutrition, focus and productivity, pain relief, emotional health, and habit change.\n\nWhat would you like to work on?",
        ],
    }
    templates = bank.get(intent, bank["default"])
    return random.choice(templates)


@app.post("/general/chat")
def general_chat(body: GeneralChatMessage):
    """
    Meditation chat endpoint — no EEG data required.
    User describes their condition directly and AI responds with wellness guidance.
    """
    history = [h.model_dump() for h in body.context]
    intent = _detect_intent(body.message)

    if _claude is not None:
        try:
            response = _call_claude_general(body.message, history)
        except Exception:
            response = _general_fallback(intent)
    else:
        response = _general_fallback(intent)

    general_suggestions = {
        "greeting":        ["I'm feeling stressed", "I'm anxious", "I have low energy", "Help me sleep better"],
        "low_energy":      ["Physical exercises for energy", "Breathing for energy", "Nutrition for energy", "Motivation tips"],
        "breathing":       ["Physical exercises", "Guide me through meditation", "Help me sleep", "Why does breathing help?"],
        "physical_exercise": ["Breathing exercise", "Meditation guide", "Nutrition tips", "I have low energy"],
        "anxiety":         ["Breathing for anxiety", "Physical grounding exercises", "Sleep help", "I feel stressed too"],
        "stress":          ["Physical exercises for stress", "Breathing for stress", "Work stress help", "Nutrition for stress"],
        "sleep":           ["Yoga Nidra guide", "Breathing for sleep", "Nutrition for sleep", "Why can't I sleep?"],
        "focus":           ["Physical exercises for focus", "Breathing for focus", "Motivation tips", "Brain nutrition"],
        "low_mood":        ["Loving-Kindness meditation", "Physical movement", "Nutrition for mood", "I feel anxious too"],
        "anger":           ["Breathing for anger", "Physical release exercises", "Why do I get angry?", "Stress help"],
        "headache":        ["Breathing for headache", "Neck stretches", "Nutrition for headaches", "Sleep help"],
        "body_pain":       ["Gentle exercises for pain", "Breathing for pain", "Anti-inflammatory nutrition", "Posture tips"],
        "physical_tension": ["Progressive muscle relaxation", "Breathing exercise", "Gentle stretches", "Stress help"],
        "motivation":      ["Physical exercises for motivation", "Habit building tips", "Focus techniques", "Energy boost"],
        "nutrition":       ["Sleep and nutrition", "Nutrition for energy", "Nutrition for anxiety", "Supplements guide"],
        "immune_health":   ["Sleep for immunity", "Nutrition for immunity", "Stress and immunity", "Exercise for immunity"],
        "self_esteem":     ["Mindfulness practice", "Physical exercises", "Motivation tips", "Low mood help"],
        "grief":           ["Loving-Kindness meditation", "Physical movement for grief", "Sleep help", "Anxiety help"],
        "addiction":       ["Breathing for cravings", "Physical exercise for habits", "Motivation tips", "Stress help"],
        "mindfulness":     ["Breathing exercise", "Physical exercises", "Sleep improvement", "Focus techniques"],
        "posture":         ["Back pain exercises", "Neck stretches", "Physical exercises", "Breathing correctly"],
        "relationships":   ["Stress help", "Breathing for emotions", "Meditation for loneliness", "Anger management"],
        "work_stress":     ["Breathing at desk", "Physical exercises for burnout", "Sleep after work", "Focus techniques"],
        "beginner":        ["Start first meditation", "Breathing exercise", "Physical exercises", "How long to meditate?"],
        "discouraged":     ["Why does it take time?", "Shorter technique 5 min", "Physical exercises instead", "Try again"],
        "default":         ["I'm feeling stressed", "I have low energy", "Help me sleep", "I'm anxious"],
    }
    suggestions = general_suggestions.get(intent, general_suggestions["default"])

    return {
        "response": response,
        "suggestions": suggestions,
        "powered_by": "claude" if _claude is not None else "rule-based",
    }


@app.post("/eeg/chat")
def wysa_chat(body: ChatMessage):
    """
    Wysa AI chatbot endpoint.
    Uses Claude API when ANTHROPIC_API_KEY is set, otherwise falls back to
    the rich multi-template rule-based system.
    """
    info = MENTAL_STATE_INFO.get(body.mental_state, MENTAL_STATE_INFO["calm"])
    history = [h.model_dump() for h in body.context]
    intent = _detect_intent(body.message)

    if _claude is not None:
        try:
            response = _call_claude(
                message=body.message,
                state=body.mental_state,
                info=info,
                band_powers=body.band_powers or {},
                history=history,
            )
        except Exception:
            response = _fallback_response(intent, body.mental_state, info, body.band_powers or {})
    else:
        response = _fallback_response(intent, body.mental_state, info, body.band_powers or {})

    return {
        "response": response,
        "suggestions": _suggestions_for(body.mental_state, intent),
        "powered_by": "claude" if _claude is not None else "rule-based",
    }
