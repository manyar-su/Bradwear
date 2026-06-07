import React, { useEffect, useState } from 'react';
import { normalizeTailorName } from '../utils/tailors';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [tailorName, setTailorName] = useState(() => normalizeTailorName(localStorage.getItem('profileName')) || localStorage.getItem('profileName') || '');
  const [isReady, setIsReady] = useState(() => localStorage.getItem('isLoggedIn') === 'true' && !!(normalizeTailorName(localStorage.getItem('profileName')) || localStorage.getItem('profileName')));

  useEffect(() => {
    const stored = localStorage.getItem('profileName');
    const normalizedStored = normalizeTailorName(stored) || stored || '';
    if (normalizedStored) {
      localStorage.setItem('profileName', normalizedStored);
      setTailorName(normalizedStored);
    } else {
      localStorage.setItem('profileName', '');
    }
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeTailorName(tailorName) || tailorName.trim();
    if (!normalized) return;

    localStorage.setItem('profileName', normalized);
    localStorage.setItem('isLoggedIn', 'true');
    setIsReady(true);
  };

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#14532d_0%,#020617_55%)] px-5 py-12 flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[2rem] border border-emerald-500/20 bg-slate-950/90 p-7 shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Bradflow</p>
        <h1 className="mt-2 text-2xl font-black uppercase">Nama Penjahit</h1>
        <p className="mt-2 text-[10px] font-bold text-slate-400">
          Isi nama penjahit. Nama ini otomatis dipakai untuk profil dan user aktif aplikasi.
        </p>

        <label className="mt-6 block text-[9px] font-black uppercase text-slate-400">Siapa nama penjahit?</label>
        <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900">
          <input
            value={tailorName}
            onChange={(event) => setTailorName(event.target.value)}
            className="w-full bg-transparent px-3 py-3 text-xs font-bold outline-none"
            placeholder="Contoh: Maris"
            required
            autoFocus
          />
        </div>

        <button className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-[10px] font-black uppercase">
          Lanjut Masuk
        </button>
      </form>
    </main>
  );
};

export default AuthGate;
