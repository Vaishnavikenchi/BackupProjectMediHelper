import React, { useState } from 'react';
import { MapPin, Navigation, Search, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { addNearbyHistory } from '../../firebase/firestoreService';

export default function NearbyMedicalShops() {
  const [locationQuery, setLocationQuery] = useState('');
  const [medicineQuery, setMedicineQuery] = useState('Paracetamol');
  const [activeLocation, setActiveLocation] = useState('Solapur'); // Default map fallback
  const [isLocating, setIsLocating] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const { currentUser } = useAuth();

  // Sample data for Nearby Medical Shops
  const sampleShops = [
    {
      id: 1,
      name: 'Datta Krupa Medico',
      distance: '1.3 km',
      isNearest: true,
      status: 'Open Now',
      medicinesAvailable: true,
      address: 'Aasara Chowk, Solapur',
      phone: '9876543213',
      time: 'Closes at 10 PM',
      medicines: ['paracetamol', 'ibuprofen', 'amoxicillin', 'cough syrup']
    },
    {
      id: 2,
      name: 'New Maharashtra Medical',
      distance: '1.5 km',
      isNearest: false,
      status: 'Open Now',
      medicinesAvailable: true,
      address: 'Navi Peth, Solapur',
      phone: '9876543214',
      time: '24 Hours',
      medicines: ['paracetamol', 'aspirin', 'vitamin c', 'bandage']
    },
    {
      id: 3,
      name: 'HealthPlus Medics',
      distance: '2.5 km',
      isNearest: false,
      status: 'Closed',
      medicinesAvailable: false,
      address: 'Salgar Vasti, Solapur',
      phone: '9876543215',
      time: 'Opens at 8 AM tomorrow',
      medicines: ['ibuprofen', 'cetirizine', 'cough syrup', 'inhaler']
    },
    {
      id: 4,
      name: 'City Care Pharmacy',
      distance: '3.1 km',
      isNearest: false,
      status: 'Open Now',
      medicinesAvailable: true,
      address: 'Hotgi Road, Solapur',
      phone: '9876543216',
      time: 'Closes at 9 PM',
      medicines: ['paracetamol', 'ibuprofen', 'aspirin', 'vitamin c', 'amoxicillin']
    }
  ];

  const filteredShops = sampleShops.filter(shop => {
    if (inStockOnly && !shop.medicinesAvailable) return false;
    if (!medicineQuery.trim()) return true;
    const searchTerms = medicineQuery.toLowerCase().split(' ').filter(val => val.length > 0);
    return searchTerms.some(term => shop.medicines.some(med => med.includes(term)));
  });

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    toast.loading('Fetching your location...', { id: 'location-toast' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Construct a coordinate string for the map search
        const coords = `${latitude},${longitude}`;
        setActiveLocation(coords);
        setLocationQuery('My Current Location');
        toast.success('Location updated', { id: 'location-toast' });
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to retrieve your location', { id: 'location-toast' });
        setIsLocating(false);
      }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!locationQuery.trim() && !medicineQuery.trim()) {
      toast.error('Please enter a location or medicine to search');
      return;
    }
    if (locationQuery.trim()) {
      setActiveLocation(locationQuery);
    }
    toast.success(`Searching...`);
    if (currentUser) {
      addNearbyHistory(currentUser.uid, locationQuery || activeLocation, medicineQuery).catch(console.warn);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-2">
      {/* Header section */}
      <div className="flex items-center gap-4 mb-6 mt-2">
        <div className="p-3.5 bg-[#5e43f3] text-white rounded-[1rem] shadow-lg shadow-[#5e43f3]/30 flex-shrink-0">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Nearby Shops
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Find pharmacies stocking your medicine
          </p>
        </div>
      </div>

      {/* Search Bar matching the mock */}
      <div className="bg-white p-5 rounded-[1.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] flex flex-col gap-5 mb-8 relative z-10 w-full border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-col gap-5 w-full">
            <div className="flex xl:flex-row flex-col items-center gap-4 w-full">
              {/* Medicine Search */}
              <div className="flex-1 flex items-center bg-white border-2 border-[#5e43f3] rounded-full overflow-hidden focus-within:ring-4 focus-within:ring-[#5e43f3]/20 transition-all w-full">
                <div className="pl-4 pr-1 text-[#5e43f3]">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Paracetamol"
                  className="w-full py-3 pr-4 outline-none text-slate-800 bg-transparent placeholder-slate-400 font-medium"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                />
              </div>

              {/* Location Search */}
              <div className="flex-1 flex items-center bg-[#f8fafc] border-2 border-transparent hover:border-slate-200 focus-within:border-slate-300 rounded-full overflow-hidden focus-within:bg-white transition-all w-full">
                <div className="pl-4 pr-1 text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="City name (or use button)"
                  className="w-full py-3 pr-4 outline-none text-slate-700 bg-transparent placeholder-slate-400 font-medium"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>

              {/* Location Locate button */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="w-12 h-12 flex items-center justify-center bg-[#5e43f3] hover:bg-[#4a35c5] text-white rounded-full transition-all shadow-lg shadow-[#5e43f3]/30 flex-shrink-0 disabled:opacity-50"
              >
                <Navigation className={`w-5 h-5 ${isLocating ? 'animate-pulse' : '-rotate-45 relative right-0.5 top-0.5'}`} style={{ fill: 'currentColor' }} />
              </button>
            </div>

            {/* Bottom Row of Search */}
            <div className="flex justify-between items-center w-full px-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                   type="checkbox" 
                   checked={inStockOnly}
                   onChange={e => setInStockOnly(e.target.checked)}
                   className="w-4 h-4 rounded text-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/50 border-slate-300"
                   style={{ accentColor: '#0ea5e9' }}
                />
                <span className="text-sm font-bold text-slate-700">In Stock Only</span>
              </label>

              <button 
                type="submit" 
                className="bg-[#5e43f3] hover:bg-[#4a35c5] text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-md shadow-[#5e43f3]/25 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find
              </button>
            </div>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[400px]">
        {/* Left List */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-shrink-0 lg:pr-2 pb-4">
          {filteredShops.map((shop) => (
            <div key={shop.id} className={`bg-white rounded-[1.25rem] shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col relative border ${shop.medicinesAvailable ? 'border-l-4 border-l-[#10b981] border-slate-100' : 'border-l-4 border-l-slate-300 border-slate-100'}`}>
              
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg text-slate-800">{shop.name}</h3>
                {shop.isNearest && (
                  <span className="bg-indigo-50 text-indigo-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex-shrink-0">
                    Nearest
                  </span>
                )}
              </div>
              
              <p className="text-sm text-slate-500 mb-3">{shop.address}</p>
              
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                <Phone className="w-4 h-4" />
                <span>{shop.phone}</span>
              </div>

              <div className="flex items-center justify-between text-sm mb-4 pt-3.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[#5e43f3] font-semibold">
                  <Navigation className="w-4 h-4 rotate-45" />
                  <span>{shop.distance}</span>
                </div>
                {shop.medicinesAvailable ? (
                  <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.name + ' ' + shop.address)}`}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Navigation className="w-4 h-4 rotate-45" />
                Get Directions
              </button>
            </div>
          ))}
          {filteredShops.length === 0 && (
            <div className="p-8 text-center bg-white rounded-[1.25rem] border border-slate-100 text-slate-500">
              <p className="font-medium">No results found.</p>
            </div>
          )}
        </div>

        {/* Right Area for Map */}
        <div className="flex-1 bg-slate-100 rounded-3xl overflow-hidden relative shadow-inner border border-slate-200/60 mb-4 min-h-[400px]">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${medicineQuery.trim() ? encodeURIComponent(medicineQuery + ' pharmacy') : 'pharmacy'}+near+${encodeURIComponent(activeLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            title="Nearby Pharmacies Google Map"
            className="w-full h-full opacity-90 sepia-[.1] hue-rotate-[-10deg]" // Slight styling to blend iframe
          ></iframe>
        </div>
      </div>
    </div>
  );
}
