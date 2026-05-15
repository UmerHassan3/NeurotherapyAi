from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="NeuroTherapy AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class FeaturesInput(BaseModel):
    features: list[float]


@app.get("/")
def health_check():
    return {"status": "ok", "service": "neurotherapy-ai"}


@app.post("/analyze-features")
def analyze_features(body: FeaturesInput):
    return {
        "received_count": len(body.features),
        "prediction": "neutral",
        "confidence": 0.91,
        "label": 0,
        "message": "Dummy response — model not yet connected.",
    }
