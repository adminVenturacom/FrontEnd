import React, { useState } from 'react';
import { X, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session) {
        onAuthSuccess(data.session.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-opacity animate-fade-in">
      {/* Contenedor Flotante */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 transform transition-all">
        {/* Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-brand-blue mb-3">
            <div className="w-5 h-5 rounded-full bg-brand-blue ring-4 ring-blue-100" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Accede a Venturacom</h3>
          <p className="text-sm text-slate-500 mt-1">Ingresa para explorar la infraestructura del futuro</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 rounded-smooth text-slate-700 font-medium text-sm shadow-sm hover:shadow transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">O usa tu email</span></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-smooth text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-smooth text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-blue hover:bg-brand-hover text-white font-medium rounded-smooth shadow-md shadow-brand-blue/25 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}