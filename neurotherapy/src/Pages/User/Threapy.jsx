import { useState, useRef, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
} from "recharts";
import {
  Brain, Wifi, Send, Loader2, Activity, ChevronRight,
  Zap, Moon, Wind, Heart, Star, RefreshCw, MessageSquare, ArrowLeft, Save, CheckCircle,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BAND_META = {
  delta: { label: "Delta", color: "#6366f1", desc: "0.5–4 Hz · Deep rest" },
  theta: { label: "Theta", color: "#8b5cf6", desc: "4–8 Hz · Creativity" },
  alpha: { label: "Alpha", color: "#22c55e", desc: "8–13 Hz · Calm focus" },
  beta:  { label: "Beta",  color: "#ef4444", desc: "13–30 Hz · Active thinking" },
  gamma: { label: "Gamma", color: "#f59e0b", desc: "30–100 Hz · Peak performance" },
};

const STATE_ICON = { stressed: Zap, anxious: Wind, relaxed: Heart, focused: Star, drowsy: Moon, calm: Brain };

const ANALYSIS_STEPS = [
  "Connecting to alexispomares/dissertation-raw dataset…",
  "Loading subject EEG recordings…",
  "Extracting brainwave band powers…",
  "Classifying mental state…",
  "Preparing Neuro AI recommendations…",
];

// ─── sub-components ──────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow">
      <Brain className="w-4 h-4 text-white" />
    </div>
  );
}

function ChatBubble({ msg }) {
  const isBot = msg.role === "bot";
  return (
    <div className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && <BotAvatar />}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
          isBot
            ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
            : "bg-violet-600 text-white rounded-tr-none"
        }`}
        dangerouslySetInnerHTML={{
          __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
        }}
      />
    </div>
  );
}

function QuickReplies({ suggestions, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 pl-10 mt-1">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-3 py-1.5 hover:bg-violet-100 transition"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function WysaChat({ eegData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!eegData) return;
    (async () => {
      setIsTyping(true);
      await sleep(800);
      const res = await fetch("/ai-api/eeg/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "start",
          mental_state: eegData.mental_state,
          band_powers: eegData.band_powers,
          context: [],
        }),
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages([{ role: "bot", text: data.response }]);
      setLastSuggestions(data.suggestions);
    })();
  }, [eegData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setInput("");
    setLastSuggestions([]);

    const newUserMsg = { role: "user", text: msg };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    // pass the last 10 messages as conversation history so Claude has context
    const history = [...messages, newUserMsg]
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch("/ai-api/eeg/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          mental_state: eegData.mental_state,
          band_powers: eegData.band_powers,
          context: history,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.response }]);
      setLastSuggestions(data.suggestions);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I'm having trouble connecting right now. Please try again in a moment. 💙" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-violet-600 rounded-t-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Neuro AI · Wellness</p>
          <p className="text-violet-200 text-xs">EEG-powered meditation guide</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-violet-200 text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
        {messages.map((m, i) => (
          <div key={i}>
            <ChatBubble msg={m} />
            {m.role === "bot" && i === messages.length - 1 && lastSuggestions.length > 0 && (
              <QuickReplies suggestions={lastSuggestions} onSelect={send} />
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center">
            <BotAvatar />
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 rounded-b-2xl px-3 py-2.5 flex gap-2">
        <input
          className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-violet-300"
          placeholder="Ask Neuro AI anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-violet-700 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MeditationChat({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    // Show greeting immediately — no network call needed
    setMessages([{
      role: "bot",
      text: "Hi! I'm your AI wellness guide. Tell me how you're feeling today — whether stressed, anxious, tired, or just wanting to improve your wellbeing — and I'll recommend the right meditation, breathing, or physical exercises for you. 💙",
    }]);
    setLastSuggestions(["I'm feeling stressed", "I'm anxious", "Help me sleep better", "I want to focus better"]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setInput("");
    setLastSuggestions([]);
    setSaveStatus("idle");

    const newUserMsg = { role: "user", text: msg };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    const history = [...messages, newUserMsg]
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    const manualCancel = { current: false };

    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("/ai-api/general/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ message: msg, context: history }),
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.response }]);
      setLastSuggestions(data.suggestions || []);
    } catch {
      if (!manualCancel.current) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "⚠️ Could not reach the AI service. Make sure the Python service is running:\n\nOpen a terminal → `cd ai-service` → `python -m uvicorn app:app --reload --port 8000`\n\nKeep that terminal open, then try again. 💙",
          },
        ]);
      }
    } finally {
      abortRef.current = null;
      setIsTyping(false);
    }
  };

  const cancelRequest = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsTyping(false);
  };

  const saveSession = async () => {
    const userMsgCount = messages.filter((m) => m.role === "user").length;
    if (userMsgCount === 0) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, text: m.text })),
          sessionType: "meditation_chat",
          summary: messages.find((m) => m.role === "user")?.text?.slice(0, 100),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const userMsgCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col bg-white" style={{ minHeight: 560 }}>
      {/* Header */}
      <div className="bg-violet-600 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Meditation Chat</p>
          <p className="text-violet-200 text-xs">Describe how you feel — no EEG needed</p>
        </div>
        {userMsgCount > 0 && (
          <button
            onClick={saveSession}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full transition disabled:opacity-60"
          >
            {saveStatus === "saved" ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
            ) : saveStatus === "saving" ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> Save Session</>
            )}
          </button>
        )}
      </div>

      {saveStatus === "error" && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-xs text-red-600">
          Could not save — please make sure you are logged in and try again.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
        {messages.map((m, i) => (
          <div key={i}>
            <ChatBubble msg={m} />
            {m.role === "bot" && i === messages.length - 1 && lastSuggestions.length > 0 && (
              <QuickReplies suggestions={lastSuggestions} onSelect={send} />
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center">
            <BotAvatar />
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <button
                onClick={cancelRequest}
                className="text-xs text-gray-400 hover:text-red-500 transition"
                title="Cancel request"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex gap-2">
        <input
          className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-violet-300"
          placeholder="Tell me how you're feeling…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isTyping && send()}
        />
        {isTyping ? (
          <button
            onClick={cancelRequest}
            className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition"
            title="Cancel"
          >
            <span className="text-sm font-bold">✕</span>
          </button>
        ) : (
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-violet-700 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function EEGPanel({ eegData }) {
  const radarData = Object.entries(eegData.band_powers).map(([k, v]) => ({
    band: BAND_META[k].label,
    value: v,
    fullMark: 20,
  }));

  const StateIcon = STATE_ICON[eegData.mental_state] || Brain;
  const color = eegData.state_info.color;

  return (
    <div className="space-y-4">
      {/* State badge */}
      <div
        className="rounded-xl p-4 text-white flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <StateIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Detected State</p>
          <p className="text-xl font-bold capitalize">{eegData.mental_state}</p>
          <p className="text-xs opacity-80">{eegData.state_info.description}</p>
        </div>
        <div className="ml-auto text-right text-xs opacity-80">
          <p>Subject #{eegData.subject_id}</p>
          <p>Session {eegData.session}</p>
          <p className="mt-1 opacity-70">{eegData.dataset}</p>
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Brainwave Band Powers</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="band" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 20]} />
            <Radar
              name="Power"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Band breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Band Breakdown</p>
        {Object.entries(eegData.band_powers).map(([k, v]) => {
          const meta = BAND_META[k];
          const pct = Math.min(100, (v / 20) * 100);
          return (
            <div key={k}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-medium text-gray-700">{meta.label}</span>
                <span className="text-gray-400">{v} µV²/Hz</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw signal preview */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Raw EEG Signal (AF3 channel)</p>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={eegData.signal_preview}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={color}
              dot={false}
              strokeWidth={1.5}
            />
            <XAxis dataKey="t" hide />
            <YAxis hide domain={["auto", "auto"]} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Existing therapy cards ───────────────────────────────────────────────────
const THERAPIES = [
  { id: 1, name: "Cognitive Behavioural Therapy", desc: "Identify and change negative thought patterns through structured sessions.", duration: "45–60 min", price: 80 },
  { id: 2, name: "Neurofeedback Therapy", desc: "Train healthier brainwave patterns using real-time EEG feedback.", duration: "45–60 min", price: 100 },
  { id: 3, name: "Mindfulness Therapy", desc: "Be fully present and engaged with the current moment.", duration: "30–45 min", price: 60 },
  { id: 4, name: "Group Therapy", desc: "Shared therapeutic sessions with people on similar journeys.", duration: "60–90 min", price: 40 },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Therapy() {
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | connecting | analyzing | ready
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("");
  const [eegData, setEegData] = useState(null);
  const [error, setError] = useState(null);
  const [chatMode, setChatMode] = useState(false);

  const runAnalysis = async (isDevice) => {
    setError(null);
    setPhase("connecting");
    setProgress(0);

    await sleep(1200);
    setPhase("analyzing");

    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setStepLabel(ANALYSIS_STEPS[i]);
      const startPct = (i / ANALYSIS_STEPS.length) * 100;
      const endPct = ((i + 1) / ANALYSIS_STEPS.length) * 100;
      for (let j = 0; j <= 10; j++) {
        setProgress(startPct + (endPct - startPct) * (j / 10));
        await sleep(50);
      }
      await sleep(350);
    }

    try {
      const res = await fetch("/ai-api/eeg/simulate");
      if (!res.ok) throw new Error("AI service unavailable");
      const data = await res.json();
      setEegData(data);
      setPhase("ready");
    } catch (e) {
      setError("Could not reach the AI service. Make sure the Python service is running on port 8000.");
      setPhase("idle");
    }
  };

  const reset = () => {
    setPhase("idle");
    setEegData(null);
    setProgress(0);
    setError(null);
    setChatMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ── EEG Section ── */}
        <section>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">EEG-Powered Meditation</h2>
              <p className="text-sm text-gray-500">
                Powered by{" "}
                <code className="bg-gray-100 text-violet-700 px-1.5 py-0.5 rounded text-xs">
                  alexispomares/dissertation-raw
                </code>{" "}
                · Neuro AI wellness chatbot
              </p>
            </div>
          </div>

          {/* ── MEDITATION CHAT MODE ── */}
          {chatMode && (
            <div className="mt-6">
              <MeditationChat onBack={() => setChatMode(false)} />
            </div>
          )}

          {/* ── IDLE: connect buttons ── */}
          {phase === "idle" && !chatMode && (
            <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-white p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                <Activity className="w-8 h-8 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">Connect your EEG device</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Let the app read your brainwave signals for personalised AI meditation, or use the
                  demo dataset. You can also start a chat directly without any device.
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 max-w-md mx-auto">
                  {error}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                <button
                  onClick={() => runAnalysis(true)}
                  className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition shadow"
                >
                  <Wifi className="w-4 h-4" />
                  Connect EEG Device
                </button>
                <button
                  onClick={() => runAnalysis(false)}
                  className="inline-flex items-center gap-2 border border-violet-300 text-violet-700 bg-violet-50 px-6 py-3 rounded-xl font-semibold hover:bg-violet-100 transition"
                >
                  <Activity className="w-4 h-4" />
                  Use Demo Dataset
                </button>
                <button
                  onClick={() => setChatMode(true)}
                  className="inline-flex items-center gap-2 border border-green-300 text-green-700 bg-green-50 px-6 py-3 rounded-xl font-semibold hover:bg-green-100 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  Start Meditation Chat
                </button>
              </div>
            </div>
          )}

          {/* ── CONNECTING ── */}
          {phase === "connecting" && (
            <div className="mt-6 rounded-2xl border border-violet-200 bg-white p-8 text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-ping opacity-40" />
                <div className="absolute inset-2 rounded-full border-4 border-violet-400 animate-ping opacity-60" style={{ animationDelay: "0.3s" }} />
                <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center">
                  <Wifi className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Establishing connection…</p>
                <p className="text-sm text-gray-500">Loading EEG dataset</p>
              </div>
            </div>
          )}

          {/* ── ANALYZING ── */}
          {phase === "analyzing" && (
            <div className="mt-6 rounded-2xl border border-violet-200 bg-white p-8 text-center space-y-5">
              <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto" />
              <div>
                <p className="font-semibold text-gray-800">{stepLabel}</p>
                <p className="text-xs text-gray-400 mt-1">Please wait…</p>
              </div>
              <div className="max-w-sm mx-auto">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── READY: two-column results ── */}
          {phase === "ready" && eegData && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                  Analysis complete
                </p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New scan
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: EEG data */}
                <EEGPanel eegData={eegData} />

                {/* Right: Neuro AI chatbot */}
                <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 560 }}>
                  <WysaChat eegData={eegData} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Other Therapies ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Therapies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THERAPIES.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTherapy(t)}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  selectedTherapy?.id === t.id
                    ? "border-violet-500 bg-violet-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm"
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{t.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{t.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">⏱ {t.duration}</span>
                  <span className="text-base font-bold text-gray-800">${t.price}/session</span>
                </div>
              </div>
            ))}
          </div>

          {selectedTherapy && (
            <div className="mt-4 text-center">
              <button
                onClick={() => alert(`Booking for ${selectedTherapy.name} — payment integration coming soon.`)}
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-violet-700 transition shadow"
              >
                <ChevronRight className="w-4 h-4" />
                Book {selectedTherapy.name}
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
