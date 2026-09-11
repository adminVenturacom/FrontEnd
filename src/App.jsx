import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  FileText, 
  Globe2, 
  CheckCircle2, 
  LogOut, 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Send, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Receipt
} from 'lucide-react';

// Cliente Supabase tolerante a fallos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [user, setUser] = useState(null);

  // Formulario de Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Simulador de Facturación Instantánea (Hero interactivo)
  const [ruc, setRuc] = useState('0992384751001');
  const [monto, setMonto] = useState('120.00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceReady, setInvoiceReady] = useState(false);

  // Listener de Sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Extraer Nombre o Alias
  const getUserDisplayName = () => {
    if (!user) return '';
    return (
      user.user_metadata?.full_name || 
      user.user_metadata?.name || 
      user.email?.split('@')[0] || 
      'Usuario'
    );
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setAuthError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || 'Error al conectar con Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          setUser(data.session.user);
          setIsAuthOpen(false);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: email.split('@')[0] } }
        });
        if (error) throw error;
        if (data.session) {
          setUser(data.session.user);
          setIsAuthOpen(false);
        } else {
          setAuthError('Revisa tu bandeja de entrada para verificar tu cuenta.');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Error en las credenciales');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleSimulateInvoice = () => {
    setIsGenerating(true);
    setInvoiceReady(false);
    setTimeout(() => {
      setIsGenerating(false);
      setInvoiceReady(true);
    }, 900);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFDFF] text-slate-900 relative selection:bg-[#0066FF] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Luz Ambiental de fondo */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-blue-100/50 via-sky-50/20 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* 1. NAVBAR TRANSLÚCIDO GLASSMORPHISM */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-100/80 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900 select-none">
            <div className="flex -space-x-1.5 items-center">
              <span className="w-4 h-4 rounded-full bg-[#0066FF] ring-2 ring-white"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-slate-300"></span>
            </div>
            <span>Venturacom</span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] font-semibold border border-blue-100/80 hidden sm:inline-block">
              SRI 2.0 Engine
            </span>
          </div>

          {/* Menú Minimalista */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
            <a href="#emision" className="text-slate-900">Emisión Rápida</a>
            <a href="#sri" className="hover:text-slate-900 transition-colors">Integración SRI</a>
            <a href="#global" className="hover:text-slate-900 transition-colors">Multi-país</a>
            <a href="#api" className="hover:text-slate-900 transition-colors">API & Webhooks</a>
          </nav>

          {/* Estado de Usuario / Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/80 border border-slate-200/60 px-3 py-1.5 rounded-full shadow-xs">
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Avatar" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0066FF] flex items-center justify-center text-xs font-bold">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block max-w-[130px] truncate">
                    {getUserDisplayName()}
                  </span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="h-[42px] px-5 bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-semibold rounded-[14px] shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all active:scale-95"
              >
                Acceso Rápido
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-12 text-center z-10">
        
        {/* Banner Pill de Innovación */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0066FF] text-xs font-semibold mb-6 animate-fade-in shadow-xs">
          <Sparkles size={14} className="text-[#0066FF]" />
          <span>La forma más veloz de emitir hacia el SRI y el Mundo</span>
        </div>

        {/* Título Estilo OpenAI */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-3xl">
          Facturación tan simple como escribir un mensaje.
        </h1>
        <p className="mt-4 text-slate-500 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          Sin portales lentos ni firmas complejas. Emite comprobantes electrónicos con validación inmediata al SRI de Ecuador y exporta a estándares globales al instante.
        </p>

        {/* 3. SIMULADOR DE HARDWARE / INTERFAZ ULTRA RÁPIDA */}
        <div className="w-full max-w-xl mt-10 mb-8">
          <div className="relative rounded-[28px] p-1.5 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 shadow-2xl border border-white/90">
            <div className="rounded-[22px] bg-white p-6 shadow-inner text-left">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="text-[#0066FF]" size={20} />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Emisor SRI Inmediato</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SRI Online
                </div>
              </div>

              {/* Formulario Exprés integrado */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">RUC / Cédula Receptor</label>
                  <input 
                    type="text" 
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    className="w-full h-[46px] px-3.5 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total (USD)</label>
                  <input 
                    type="text" 
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full h-[46px] px-3.5 bg-slate-50 border border-slate-200 rounded-[12px] text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
                  />
                </div>
              </div>

              {/* Botón de Envío Instantáneo */}
              <div className="mt-4 flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  {invoiceReady ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> Autorizado por SRI en 0.4s
                    </span>
                  ) : 'Prueba el motor en vivo sin coste'}
                </div>

                <button
                  onClick={handleSimulateInvoice}
                  disabled={isGenerating}
                  className="h-[46px] px-6 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold rounded-[12px] shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-75"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Firmando XML...
                    </>
                  ) : (
                    <>
                      Generar Factura
                      <Send size={13} />
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* CTA Secundario / Acceso Completo */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
            className="h-[52px] px-8 bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-semibold rounded-[16px] shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            Comenzar Gratis con Venturacom
            <ArrowRight size={17} />
          </button>
        </div>
      </main>

      {/* 4. FOOTER INFORMÁTICO Y ARQUITECTURA */}
      <footer className="border-t border-slate-100 bg-white/60 backdrop-blur-md py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center sm:justify-between items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck size={16} className="text-[#0066FF]" /> SRI Offline Sync Ready
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Globe2 size={16} className="text-[#0066FF]" /> Compatible con Factura Electrónica Global
            </span>
          </div>
          <div>© {new Date().getFullYear()} Venturacom Inc. Protocolo de emisión ultra-rápido.</div>
        </div>
      </footer>

      {/* 5. MODAL DE AUTENTICACIÓN (3 PILARES UI/UX: 50px inputs, toggle pass, validation states) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-[420px] bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-[24px] p-7 transition-all">
            
            {/* Cerrar */}
            <button 
              onClick={() => setIsAuthOpen(false)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Encabezado */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] mb-3 border border-blue-100">
                <FileText size={22} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Bienvenido a Venturacom' : 'Crea tu cuenta de facturación'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'login' ? 'Emite y gestiona comprobantes al instante' : 'Empieza a facturar en menos de 1 minuto'}
              </p>
            </div>

            {/* Alerta de Error (Pilar 3: Retroalimentación y Estado) */}
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-[12px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                <span className="flex-1">{authError}</span>
              </div>
            )}

            {/* Botón Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full h-[50px] flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 rounded-[14px] text-slate-700 font-medium text-sm shadow-xs hover:shadow transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                <span className="bg-white px-2">o con correo</span>
              </div>
            </div>

            {/* Formulario (Pilar 2: Consistencia e Inputs ergonómicos de 50px) */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full h-[50px] pl-11 pr-4 bg-slate-50 border rounded-[14px] text-sm focus:outline-none transition-all ${
                    authError ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20'
                  }`}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full h-[50px] pl-11 pr-11 bg-slate-50 border rounded-[14px] text-sm focus:outline-none transition-all ${
                    authError ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Botón Acción Principal de 50px de alto */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-[50px] mt-2 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-sm rounded-[14px] shadow-md shadow-blue-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
              >
                {authLoading ? (
                  <Loader2 className="animate-spin" size={19} />
                ) : authMode === 'login' ? (
                  'Entrar a Facturar'
                ) : (
                  'Crear Cuenta Inmediata'
                )}
              </button>
            </form>

            {/* Alternar entre Login y Registro */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-xs text-slate-500 hover:text-[#0066FF] font-medium transition-colors"
              >
                {authMode === 'login' 
                  ? '¿No tienes cuenta aún? Regístrate gratis' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}