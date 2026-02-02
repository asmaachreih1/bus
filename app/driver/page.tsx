'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverPage() {
  const router = useRouter();
  const watchIdRef = useRef<number | null>(null);

  const [status, setStatus] = useState('Ready to start trip');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tripStarted, setTripStarted] = useState(false);

  useEffect(() => {
    if (!tripStarted) return;

    if (!navigator.geolocation) {
      setStatus('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoords({ lat, lng });
        setStatus('Sending live location');

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          await fetch(`${apiUrl}/api/update-location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ van_id: 1, lat, lng }),
          });
        } catch {
          setStatus('Failed to send location');
        }
      },
      (error) => {
        console.error(error);
        setStatus('Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [tripStarted]);

  const startTrip = () => {
    setTripStarted(true);
    setStatus('Trip started');
  };

  const stopTrip = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setTripStarted(false);
    setStatus('Trip stopped');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-6 font-[family-name:var(--font-geist-sans)] mesh-gradient relative">
      <div className="absolute inset-0 bus-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 animate-gradient-x z-10" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-4 mb-10 justify-center">
          <div className="p-4 bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 flex items-center justify-center">
            <span className="text-3xl">🚌</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">Bus Console</h1>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">Training Session</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className={`w-3 h-3 rounded-full ${tripStarted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-slate-200'}`} />
          </div>

          <div className="mb-10 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Operation Status</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{status}</p>
          </div>

          {coords && (
            <div className="grid grid-cols-2 gap-6 mb-10 py-6 border-y border-slate-50">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Latitude</p>
                <p className="text-sm font-mono font-bold text-slate-600">{coords.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Longitude</p>
                <p className="text-sm font-mono font-bold text-slate-600">{coords.lng.toFixed(6)}</p>
              </div>
            </div>
          )}

          {!tripStarted ? (
            <button
              onClick={startTrip}
              className="group relative w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2rem] transition-all duration-300 transform active:scale-[0.97] shadow-2xl shadow-slate-900/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-3 text-lg tracking-tight">
                START SESSION
              </span>
            </button>
          ) : (
            <button
              onClick={stopTrip}
              className="w-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold py-6 rounded-[2rem] transition-all duration-300 border border-slate-100 active:scale-[0.97]"
            >
              <span className="flex items-center justify-center gap-3 text-lg tracking-tight">
                END SESSION
              </span>
            </button>
          )}
        </div>

        <div className="mt-10 text-center px-10">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
            Keep this active so your friends can see where you are on the map.
          </p>
        </div>
      </div>
    </div>
  );
}
