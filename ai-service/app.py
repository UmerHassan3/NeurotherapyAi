from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import random

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
    system = f"""You are Wysa, a warm and empathetic AI mental wellness companion integrated with an EEG brain scanner.

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
    if not m or m in ("start", "hello", "hi", "hey", "hii", "helo"):
        return "greeting"
    if any(w in m for w in ("how am i", "what's my", "my state", "my result", "what does it show", "my eeg", "how do i look", "what did it find")):
        return "state_inquiry"
    # breathing must come before physical so "breathing exercise" routes correctly
    if any(w in m for w in ("breath", "breathing", "breathe", "box breath", "4-7-8", "pranayama", "breathing exercise")):
        return "breathing"
    # physical exercise — checked before generic recommendation
    if any(w in m for w in ("physical exercise", "physical activity", "body exercise", "body workout",
                             "yoga", "stretching", "stretch", "workout", "movement exercise",
                             "physical", "body movement", "give exercise", "suggest exercise",
                             "what exercise", "exercise for", "exercise to")):
        return "physical_exercise"
    if any(w in m for w in ("sleep", "insomnia", "can't sleep", "cant sleep", "trouble sleeping", "nidra", "nsdr")):
        return "sleep"
    if any(w in m for w in ("tired", "exhausted", "fatigue", "no energy")):
        return "sleep"
    if any(w in m for w in ("anxious", "anxiety", "panic", "panic attack", "worry", "nervous", "fear", "scared")):
        return "anxiety"
    if any(w in m for w in ("stress", "stressed", "overwhelm", "pressure", "burnout", "too much", "can't cope", "cant cope")):
        return "stress"
    if any(w in m for w in ("focus", "concentrat", "distract", "attention", "mind wander", "can't focus", "cant focus")):
        return "focus"
    if any(w in m for w in ("sad", "depress", "unhappy", "empty", "numb", "hopeless", "low mood", "down", "crying", "cry")):
        return "low_mood"
    if any(w in m for w in ("pain", "headache", "tight", "tense", "sore", "neck", "shoulder", "body ache")):
        return "physical_tension"
    if any(w in m for w in ("beginner", "new to", "never done", "first time", "don't know how", "dont know how", "where do i start")):
        return "beginner"
    if any(w in m for w in ("how long", "how many minute", "how much time", "duration", "how often", "how many times")):
        return "duration"
    if any(w in m for w in ("why", "does it work", "science", "research", "evidence", "proof", "how does meditation")):
        return "why_meditation"
    if any(w in m for w in ("job", "office", "deadline", "boss", "colleague", "career", "workload", "at work", "my work")):
        return "work_stress"
    if any(w in m for w in ("relation", "partner", "family", "friend", "lonely", "alone", "breakup", "argument")):
        return "relationships"
    if any(w in m for w in ("not working", "not helping", "doesn't work", "doesnt work", "pointless", "waste of time", "not feeling", "no difference")):
        return "discouraged"
    if any(w in m for w in ("eeg", "brainwave", "wave", "frequency", "alpha", "beta", "theta", "delta", "gamma", "what is eeg")):
        return "eeg_explanation"
    if any(w in m for w in ("more", "another", "other option", "different", "something else", "alternative", "other technique")):
        return "more_options"
    if any(w in m for w in ("start", "begin", "let's go", "let me start", "guide me", "walk me through", "step by step", "how do i do", "show me how")):
        return "start_session"
    if any(w in m for w in ("meditat", "recommend", "suggest", "what should i do", "help me", "technique", "exercise", "what do you suggest")):
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
