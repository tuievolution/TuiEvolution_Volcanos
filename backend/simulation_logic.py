# backend/simulation_logic.py
import numpy as np

# --- Sabit Ortalama Değerler (Monte Carlo için) ---
CONSTANTS = {
    "g": 9.81,
    "air_resistance": 0.98,
    "initial_mixture_density_mu": 5.74,
    "mass_discharge_rate_mu": 1.5e6,
    "magma_temperature_mu": 1273.15,
    "gas_constant_mu": 462,
    "w0_base": 800  # Baz çıkış hızı
}

def run_monte_carlo(vent_height, vent_radius):
    """
    Simülasyon 1: Parametreleri Rastgele Üretme
    """
    n = 1000
    # Monte Carlo ile parametre dağılımları
    initial_mixture_density = np.random.normal(CONSTANTS["initial_mixture_density_mu"], 0.5, n)
    mass_discharge_rate = np.random.normal(CONSTANTS["mass_discharge_rate_mu"], 1e5, n)
    
    # Hesaplanan ortalama parametreler (Web'e dönecek veriler)
    results = {
        "mixture_density": float(np.mean(initial_mixture_density)),
        "mass_discharge": float(np.mean(mass_discharge_rate)),
        "vent_height": vent_height,
        "vent_radius": vent_radius
    }
    return results

def calculate_impact(monte_carlo_results, vent_height):
    """
    Simülasyon 2: Eziliyor muyuz? (Yörünge Hesabı)
    """
    g = CONSTANTS["g"]
    w0 = CONSTANTS["w0_base"]
    
    # 20 Adet Kayaç Simülasyonu
    n_rocks = 20
    rocks_data = []
    
    max_distance = 0
    max_speed = 0
    
    for _ in range(n_rocks):
        # Rastgele açılar
        theta = np.random.uniform(0, 2 * np.pi)
        phi = np.random.uniform(0, np.pi / 2)
        v0 = np.random.uniform(w0 / 2, w0)
        
        # Basit yörünge hesabı (Hava direnci ihmal edilmiş basitleştirilmiş model)
        # Uçuş süresi (Zemin 0 kabul edildiğinde, vent_height'tan atılıyor)
        # y = h + v_y*t - 0.5*g*t^2 = 0 denkleminin çözümü
        v0_z = v0 * np.sin(phi)
        
        delta = v0_z**2 + 2 * g * vent_height
        t_flight = (v0_z + np.sqrt(delta)) / g
        
        # Yatay mesafe
        v0_x = v0 * np.cos(phi) # Yatay hız bileşeni
        distance = v0_x * t_flight
        
        # Çarpma hızı
        v_final_z = v0_z - g * t_flight
        impact_speed = np.sqrt(v0_x**2 + v_final_z**2)
        
        if distance > max_distance:
            max_distance = distance
            max_speed = impact_speed
            
        rocks_data.append({
            "distance": float(distance),
            "impact_speed": float(impact_speed),
            "flight_time": float(t_flight)
        })

    return {
        "max_rock_distance": float(max_distance),
        "max_impact_speed": float(max_speed),
        "safe_zone": float(max_distance + 500), # Güvenli bölge önerisi
        "rocks_details": rocks_data[:5] # İlk 5 kayanın detayı
    }