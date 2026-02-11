# backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import simulation_logic

app = FastAPI()

# React ile iletişim izni (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Frontend'den gelecek veri formatı
class VolcanoRequest(BaseModel):
    name: str
    elevation: float
    location: dict

@app.post("/calculate")
async def calculate(data: VolcanoRequest):
    print(f"Simülasyon isteği alındı: {data.name}, Yükseklik: {data.elevation}m")
    
    # Yeni mantık: Tek bir fonksiyon tüm işi yapar
    results = simulation_logic.run_simulation(data.elevation)
    
    return results