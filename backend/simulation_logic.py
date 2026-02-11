# backend/simulation_logic.py
import numpy as np

# --- Sabit Parametreler ---
g = 9.81
air_resistance = 0.98

# Monte Carlo Dağılım Parametreleri (Gerçekçi Volkanik Veriler)
params = {
    'initial_mixture_density': {'mu': 5.74, 'sigma': 0.5},
    'mass_discharge_rate': {'mu': 1.5e6, 'sigma': 1e5},
    'magma_temperature': {'mu': 1273.15, 'sigma': 50},
    'gas_constant': {'mu': 462, 'sigma': 50},
}

def calculate_monte_carlo_inputs(n=1000):
    """
    Rastgele parametre dağılımlarını hesaplar.
    """
    results = {
        'mixture_density': np.mean(np.random.normal(params['initial_mixture_density']['mu'], params['initial_mixture_density']['sigma'], n)),
        'mass_discharge': np.mean(np.random.normal(params['mass_discharge_rate']['mu'], params['mass_discharge_rate']['sigma'], n)),
        'temperature': np.mean(np.random.normal(params['magma_temperature']['mu'], params['magma_temperature']['sigma'], n)),
    }
    return results

def calculate_trajectory(v0, theta, phi, vent_height):
    """
    Eğik atış ve yörünge hesabı.
    vent_height: Dağın yüksekliği (simülasyonun başladığı Z noktası)
    """
    # Dikey hız bileşeni
    v0_z = v0 * np.sin(phi) 
    
    # Delta hesabı (Kök içi negatif olmasın diye kontrol)
    delta = v0_z**2 + 2 * g * vent_height
    if delta < 0: delta = 0
    
    # Uçuş süresi
    t_flight = (v0_z + np.sqrt(delta)) / g
    
    # Maksimum yatay mesafe
    v0_x = v0 * np.cos(phi) 
    range_x = v0_x * t_flight
    
    return t_flight, range_x

def run_simulation(volcano_elevation, n_rocks=20):
    """
    Frontend'den gelen yüksekliğe göre simülasyonu çalıştırır.
    """
    # 1. Monte Carlo Girdilerini Hesapla
    mc_inputs = calculate_monte_carlo_inputs()
    
    # 2. Kayaç Simülasyonu
    vent_height = float(volcano_elevation)
    w0 = 600 # Maksimum patlama hızı (m/s)
    
    max_distance = 0
    max_impact_speed = 0
    
    for _ in range(n_rocks):
        # Rastgele açılar ve hızlar
        theta = np.random.uniform(0, 2 * np.pi) # Yatay düzlem açısı
        phi = np.random.uniform(0, np.pi / 2)   # Dikey çıkış açısı
        v_r = np.random.uniform(w0 / 2, w0)     # Parçacık hızı
        
        # Yörünge hesabı
        t_flight, distance = calculate_trajectory(v_r, theta, phi, vent_height)
        
        # Çarpma hızı hesabı (Vy_son = Vy_ilk - g*t)
        v_final_z = (v_r * np.sin(phi)) - (g * t_flight)
        v_final_x = (v_r * np.cos(phi)) 
        impact_speed = np.sqrt(v_final_x**2 + v_final_z**2)
        
        if distance > max_distance:
            max_distance = distance
            max_impact_speed = impact_speed

    # 3. Sonuçları Frontend Formatına Uygun Paketle
    return {
        "monte_carlo": {
            "mixture_density": mc_inputs['mixture_density'],
            "mass_discharge": mc_inputs['mass_discharge'],
            "vent_radius": 500 # Sabit kabul edildi
        },
        "impact": {
            "max_rock_distance": max_distance,
            "max_impact_speed": max_impact_speed,
            "safe_zone": max_distance * 1.1 # %10 güvenlik payı
        }
    }