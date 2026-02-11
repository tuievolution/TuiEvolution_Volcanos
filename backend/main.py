# backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import simulation_logic

app = FastAPI()

# React uygulamasının (farklı portta çalışacağı için) buraya erişmesine izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Frontend'den gelecek veri formatı
class VolcanoData(BaseModel):
    name: str
    elevation: float # Metre cinsinden yükseklik
    location: dict   # {lat: ..., lng: ...}

@app.post("/calculate")
async def calculate_simulation(data: VolcanoData):
    # 1. Adım: Monte Carlo Parametre Hesabı
    # Radius varsayılan 500m alındı, elevation parametre olarak geldi.
    mc_results = simulation_logic.run_monte_carlo(data.elevation, 500)
    
    # 2. Adım: Ezilme Hesabı (Impact)
    impact_results = simulation_logic.calculate_impact(mc_results, data.elevation)
    
    return {
        "monte_carlo": mc_results,
        "impact": impact_results,
        "volcano_info": data
    }