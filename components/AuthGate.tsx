import React, { useEffect, useState } from 'react';
import { supabase, supabaseService } from '../services/supabaseService';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || '';
        localStorage.setItem('profileName', displayName);
        localStorage.setItem('isLoggedIn', 'true');
      }
      setAuthenticated(!!user);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || '';
        localStorage.setItem('profileName', displayName);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        localStorage.setItem('isLoggedIn', 'false');
      }
      setAuthenticated(!!user);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isSignUp
        ? await supabaseService.signUpCustomEmail(username, password)
        : await supabaseService.signInCustomEmail(username, password);

      if (result.error) throw result.error;
      if (isSignUp && !result.data.session) {
        setError('Akun dibuat, tetapi konfirmasi email masih aktif di Supabase. Matikan email confirmation agar akun custom langsung aktif.');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setLoading(false);
    }
  };

  if (loading && authenticated) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-black uppercase">Memuat Bradflow...</div>;
  }

  if (authenticated) return <>{children}</>;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#14532d_0%,#020617_55%)] px-5 py-12 flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[2rem] border border-emerald-500/20 bg-slate-950/90 p-7 shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Bradflow Cloud</p>
        <h1 className="mt-2 text-2xl font-black uppercase">{isSignUp ? 'Daftar Akun' : 'Masuk'}</h1>
        <p className="mt-2 text-[10px] font-bold text-slate-400">Akun menggunakan format nama@bradflow.com</p>

        <label className="mt-6 block text-[9px] font-black uppercase text-slate-400">Nama akun</label>
        <div className="mt-2 flex items-center rounded-xl border border-slate-700 bg-slate-900">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-xs font-bold outline-none"
            placeholder="maris"
            required
          />
          <span className="pr-3 text-[10px] font-black text-slate-500">@bradflow.com</span>
        </div>

        <label className="mt-4 block text-[9px] font-black uppercase text-slate-400">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-xs font-bold outline-none"
          minLength={6}
          required
        />

        {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[9px] font-bold text-red-300">{error}</p>}

        <button disabled={loading} className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-[10px] font-black uppercase disabled:opacity-50">
          {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
        </button>
        <button type="button" onClick={() => setIsSignUp(value => !value)} className="mt-3 w-full py-2 text-[9px] font-black uppercase text-slate-400">
          {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
        </button>
      </form>
    </main>
  );
};

export default AuthGate;
