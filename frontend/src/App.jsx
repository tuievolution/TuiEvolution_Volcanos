// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Mountain, Activity, AlertTriangle, Wind, Gauge, CheckCircle } from 'lucide-react';
import L from 'leaflet';

// GÖRSELLERİ İMPORT ET
import magmaDarkBg from './assets/magma-bg.jpg';       // Dark Mode Resmi
import magmaLightBg from './assets/magma_ligthmode.png'; // Light Mode Resmi

// --- Harita İkonu Düzeltmesi ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Sahte Yanardağ Verisi ---
const VOLCANOES = [
  { id: 1, name: "Etna", elevation: 3357, position: [37.75, 14.99], status: "Active" },
  { id: 2, name: "Vesuvius", elevation: 1281, position: [40.81, 14.42], status: "Dormant" },
  { id: 3, name: "Mount Fuji", elevation: 3776, position: [35.36, 138.72], status: "Active" },
  { id: 4, name: "Mount St. Helens", elevation: 2549, position: [46.19, -122.19], status: "Active" },
  { id: 5, name: "Agri Dagi (Ararat)", elevation: 5137, position: [39.70, 44.29], status: "Dormant" },
];

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function App() {
  const [selectedVolcano, setSelectedVolcano] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const filteredVolcanoes = VOLCANOES.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCalculate = async () => {
    if (!selectedVolcano) return;
    setLoading(true);
    setResults(null);

    try {
      // Backend'e istek atıyoruz
      const response = await axios.post('http://localhost:8000/calculate', {
        name: selectedVolcano.name,
        elevation: selectedVolcano.elevation, // Seçilen dağın yüksekliğini gönderiyoruz
        location: { lat: selectedVolcano.position[0], lng: selectedVolcano.position[1] }
      });
      
      // Biraz gerçekçilik için yapay gecikme (opsiyonel)
      setTimeout(() => {
        setResults(response.data);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error("Hesaplama Hatası:", error);
      setLoading(false);
      alert("Simülasyon sunucusuna bağlanılamadı. Backend'in çalıştığından emin olun.");
    }
  };

  // --- DİNAMİK CSS SINIFLARI ---
  const inputBgClass = darkMode 
    ? 'bg-black/50 border-dark-border text-white placeholder-gray-400' 
    : 'bg-white/80 border-light-border text-stone-800 placeholder-stone-500';
  
  const cardClass = darkMode 
    ? 'bg-dark-surface/90 border-dark-border backdrop-blur-sm' 
    : 'bg-white/90 border-light-border backdrop-blur-sm shadow-xl';

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 bg-cover bg-fixed bg-center`}
      style={{
        backgroundImage: `url(${darkMode ? magmaDarkBg : magmaLightBg})`,
        backgroundBlendMode: darkMode ? 'hard-light' : 'normal',
        backgroundColor: darkMode ? '#000000' : 'transparent' 
      }}
    >
      <div className={`min-h-screen w-full ${darkMode ? 'bg-black/70' : 'bg-orange-50/20'}`}>
      
      {/* --- HEADER --- */}
      <nav className={`p-4 border-b flex justify-between items-center backdrop-blur-md sticky top-0 z-50 
          ${darkMode ? 'border-dark-border bg-black/80' : 'border-light-border bg-white/70'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Mountain className="text-volcano-red animate-pulse-slow" size={40} strokeWidth={2} />
            <div className="absolute -top-1 right-[35%] w-2 h-2 bg-volcano-orange rounded-full animate-ping"></div>
          </div>
          <h1 className={`text-2xl font-black tracking-widest ${darkMode ? 'text-white' : 'text-stone-800'}`}>
            VOLCANOS <span className="text-volcano-orange text-sm font-extrabold px-1 border border-volcano-orange rounded">SIMULATOR</span>
          </h1>
        </div>
        <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Yanardağ Ara..." 
              className={`px-3 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-volcano-orange ${inputBgClass}`}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`text-sm border px-4 py-1 rounded font-bold transition-all transform hover:scale-105
                ${darkMode 
                  ? 'border-volcano-orange text-volcano-orange bg-black hover:bg-volcano-orange hover:text-white' 
                  : 'border-volcano-red text-white bg-volcano-red hover:bg-red-700 shadow-md'}`}>
                {darkMode ? 'Mod: 🔥 MAGMA' : 'Mod: 🌸 FUJI'}
            </button>
        </div>
      </nav>

      <main className="container mx-auto p-4 space-y-6">
        
        {/* --- ÜST KISIM --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            {/* SOL: HARİTA */}
            <div className={`md:col-span-2 rounded-xl overflow-hidden border-4 shadow-2xl relative z-0 
                ${darkMode ? 'border-dark-border' : 'border-light-border'}`}>
                <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                    <ChangeView center={selectedVolcano ? selectedVolcano.position : [20, 0]} zoom={selectedVolcano ? 10 : 2} />
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url={darkMode 
                          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} 
                    />
                    {filteredVolcanoes.map(v => (
                        <Marker 
                            key={v.id} 
                            position={v.position}
                            eventHandlers={{ click: () => { setSelectedVolcano(v); setResults(null); } }}
                        >
                            <Popup className={!darkMode ? 'text-stone-900' : ''}>{v.name}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* SAĞ: BİLGİ PANELİ */}
            <div className={`p-6 rounded-xl border-2 flex flex-col justify-between shadow-lg transition-all ${cardClass}`}>
                <div>
                    <h2 className={`text-xl font-bold border-b pb-2 mb-4 flex items-center gap-2
                      ${darkMode ? 'border-volcano-red text-white' : 'border-light-border text-stone-800'}`}>
                        <Mountain size={24} className="text-volcano-orange" /> 
                        {selectedVolcano ? selectedVolcano.name : "Yanardağ Seçiniz"}
                    </h2>
                    {selectedVolcano ? (
                        <div className={`space-y-4 ${darkMode ? 'text-gray-200' : 'text-stone-700'}`}>
                            <div className={`flex justify-between items-center p-2 rounded ${darkMode ? 'bg-black/10' : 'bg-orange-100/50'}`}>
                                <span>Yükseklik:</span>
                                <span className="font-mono text-volcano-orange font-bold text-lg">{selectedVolcano.elevation} m</span>
                            </div>
                            <div className={`flex justify-between items-center p-2 rounded ${darkMode ? 'bg-black/10' : 'bg-orange-100/50'}`}>
                                <span>Durum:</span>
                                <span className={`font-bold px-2 py-0.5 rounded ${selectedVolcano.status === 'Active' ? 'bg-red-900/50 text-red-400' : 'bg-green-200 text-green-800'}`}>
                                    {selectedVolcano.status}
                                </span>
                            </div>
                            <div className={`mt-6 p-3 rounded border text-sm font-medium
                              ${darkMode ? 'bg-black/40 border-volcano-red/30' : 'bg-orange-50 border-orange-200 text-stone-600'}`}>
                                <p>⚠️ Simülasyon, seçilen dağın yüksekliği baz alınarak çalıştırılacaktır.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-70 mt-10">
                            <p>Haritadan bir yanardağ seçerek bilgilerini görüntüleyin.</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleCalculate}
                    disabled={!selectedVolcano || loading}
                    className={`w-full py-4 rounded-lg font-bold text-lg tracking-wider transition-all transform hover:scale-[1.02] active:scale-95 shadow-volcano-glow
                    ${!selectedVolcano ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed shadow-none' : 
                      loading ? 'bg-volcano-orange/80 animate-pulse' : 'bg-volcano-orange hover:bg-volcano-red text-white'}`}
                >
                    {loading ? "HESAPLANIYOR..." : "SİMÜLASYONU BAŞLAT"}
                </button>
            </div>
        </div>

        {/* --- SONUÇLAR --- */}
        <div className="text-center py-6">
           <h2 className={`text-3xl font-black uppercase tracking-[0.2em] drop-shadow-md inline-block px-6 py-2 rounded-full backdrop-blur-sm
             ${darkMode ? 'text-volcano-orange bg-black/20' : 'text-stone-800 bg-white/60 border border-light-border'}`}>
             Simülasyon Sonuçları
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            <ResultBox title="1. Monte Carlo Parametreleri" loading={loading} data={results} delay={0} icon={<Activity />} darkMode={darkMode} cardClass={cardClass}>
                {results && (
                    <div className="space-y-3 text-sm font-bold">
                         <p className={`flex justify-between border-b pb-1 ${darkMode ? 'border-white/10' : 'border-stone-200'}`}><span>Yoğunluk:</span> <span className="text-volcano-orange">{results.monte_carlo.mixture_density.toFixed(2)} kg/m³</span></p>
                         <p className={`flex justify-between border-b pb-1 ${darkMode ? 'border-white/10' : 'border-stone-200'}`}><span>Kütle Debisi:</span> <span className="text-volcano-orange">{results.monte_carlo.mass_discharge.toExponential(2)} kg/s</span></p>
                         <p className="flex justify-between"><span>Vent Yarıçapı:</span> <span className="text-volcano-orange">{results.monte_carlo.vent_radius} m</span></p>
                    </div>
                )}
            </ResultBox>

            <ResultBox title="2. Eziliyor Muyuz?" loading={loading} data={results} delay={200} icon={<AlertTriangle className="text-volcano-red"/>} darkMode={darkMode} cardClass={cardClass}>
                {results && (
                    <div className="text-center">
                        <p className="text-lg opacity-80">Maksimum Kaya Mesafesi</p>
                        <p className="text-5xl font-black text-volcano-red my-3 drop-shadow-lg">{results.impact.max_rock_distance.toFixed(0)} m</p>
                        <p className="text-xs opacity-60">Bacadan itibaren</p>
                    </div>
                )}
            </ResultBox>

            <ResultBox title="3. Çarpma Şiddeti" loading={loading} data={results} delay={400} icon={<Gauge />} darkMode={darkMode} cardClass={cardClass}>
                {results && (
                    <div className="text-center">
                        <p className="text-lg opacity-80">Maks. Çarpma Hızı</p>
                        <p className="text-4xl font-bold text-volcano-orange my-3">{results.impact.max_impact_speed.toFixed(1)} m/s</p>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${darkMode ? 'bg-black/20' : 'bg-orange-100 text-stone-800'}`}>
                          {(results.impact.max_impact_speed * 3.6).toFixed(0)} km/saat
                        </div>
                    </div>
                )}
            </ResultBox>

             <ResultBox title="4. Güvenli Bölge Analizi" loading={loading} data={results} delay={600} icon={<Mountain className="text-green-500" />} darkMode={darkMode} cardClass={cardClass}>
                {results && (
                    <div className={`p-4 rounded border ${darkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'}`}>
                        <p className="font-bold text-green-600 flex items-center gap-2"><CheckCircle size={16}/> Önerilen Mesafe:</p>
                        <p className={`text-3xl font-bold my-2 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{results.impact.safe_zone.toFixed(0)} m</p>
                    </div>
                )}
            </ResultBox>

             <ResultBox title="5. Atmosferik Etki" loading={loading} data={results} delay={800} icon={<Wind />} darkMode={darkMode} cardClass={cardClass}>
                {results && (
                    <div className="space-y-4">
                        <p className="opacity-80 font-medium">Hava direnci katsayısı:</p>
                        <div className={`w-full h-6 rounded-full overflow-hidden p-1 ${darkMode ? 'bg-gray-700' : 'bg-stone-200'}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-volcano-orange to-volcano-yellow relative" style={{width: '98%'}}>
                              <span className="absolute right-2 top-0 bottom-0 flex items-center text-xs font-bold text-white drop-shadow">0.98</span>
                            </div>
                        </div>
                    </div>
                )}
            </ResultBox>

             <ResultBox title="6. Nihai Karar" loading={loading} data={results} delay={1000} icon={<Mountain className="text-volcano-red" />} darkMode={darkMode} cardClass={cardClass}>
                {results && (
                    <div className="text-center flex flex-col items-center justify-center h-full space-y-4">
                        {results.impact.max_rock_distance > 5000 ? (
                            <div className="animate-pulse">
                              <AlertTriangle size={48} className="text-volcano-red mx-auto mb-2" />
                              <span className="text-volcano-red font-black text-2xl tracking-wider drop-shadow-lg">TEHLİKE BÜYÜK!</span>
                            </div>
                        ) : (
                             <div>
                               <Activity size={48} className="text-volcano-orange mx-auto mb-2" />
                               <span className="text-volcano-orange font-bold text-2xl">DİKKATLİ OL</span>
                             </div>
                        )}
                    </div>
                )}
            </ResultBox>
        </div>
      </main>
      </div>
    </div>
  );
}

// --- ORTAK SONUÇ KUTUSU ---
function ResultBox({ title, loading, data, children, delay, icon, darkMode, cardClass }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (data && !loading) {
            const timer = setTimeout(() => setShow(true), delay);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [data, loading, delay]);

    return (
        <div className={`rounded-xl p-6 min-h-[220px] flex flex-col relative overflow-hidden transition-all border-2 hover:border-volcano-orange ${cardClass}`}>
            <div className={`flex items-center gap-3 mb-4 border-b pb-3 ${darkMode ? 'border-gray-700' : 'border-light-border'}`}>
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/40' : 'bg-orange-100'}`}>
                  {icon}
                </div>
                <h3 className={`font-bold text-lg tracking-wide ${darkMode ? 'text-white' : 'text-stone-800'}`}>{title}</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-volcano-orange border-t-volcano-yellow rounded-full animate-spin"></div>
                    </div>
                ) : show && data ? (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                ) : (
                    <span className="opacity-50 text-sm italic flex items-center gap-2">
                      <Mountain size={16} /> Veri bekleniyor...
                    </span>
                )}
            </div>
        </div>
    );
}