import React, { useState } from "react";
import { MonitorPlay, Key, Mail, Settings, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { FirebaseConfig } from "../types";
import ConfigPanel from "./ConfigPanel";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  firebaseActive: boolean;
  connectionError: string | null;
  config: FirebaseConfig | null;
  onConnectFirebase: (config: FirebaseConfig | null) => void;
  isLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

export default function LoginScreen({
  onLogin,
  firebaseActive,
  connectionError,
  config,
  onConnectFirebase,
  isLoading,
  authError,
  setAuthError
}: LoginScreenProps): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email, password);
  };

  const handleUseDemo = () => {
    setEmail("admin@incarsads.com");
    setPassword("admin123");
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none"></div>

      <header className="px-6 py-6 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl shadow-lg">
            <MonitorPlay className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              InCarsAds
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                Admin Panel
              </span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition border ${
            showConfig
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
          }`}
        >
          <Settings size={14} className={showConfig ? "animate-spin" : ""} />
          <span>{firebaseActive ? "Firebase Conectado" : "Configurar Firebase"}</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          
          {showConfig && (
            <div className="border border-slate-800 rounded-2xl bg-slate-950 p-1">
              <ConfigPanel
                config={config}
                onSaveConfig={onConnectFirebase}
                isFirebaseActive={firebaseActive}
                connectionError={connectionError}
              />
              <div className="p-4 pt-0 text-[11px] text-slate-500 text-center leading-relaxed">
                Ao configurar seu Firebase, a autenticação usará os usuários criados no menu <b>Authentication</b> do seu painel Firebase.
              </div>
            </div>
          )}

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur-sm">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold tracking-tight text-white">Login Administrativo</h2>
              <p className="text-xs text-slate-400">
                {firebaseActive
                  ? "Insira suas credenciais cadastradas no Firebase Authentication."
                  : "Modo de Demonstração ativo. Use as credenciais fictícias ou conecte seu Firebase acima."}
              </p>
            </div>

            {authError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 text-xs">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Erro de Acesso</p>
                  <p className="opacity-90">{authError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/60 text-[11px]">
              <span className="text-slate-400 font-medium">Conectividade de Backend:</span>
              {firebaseActive ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  FIREBASE REAL ATIVO
                </span>
              ) : (
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  DEMO (LOCAL STORAGE)
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@incarsads.com"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de administrador"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 pl-10 pr-10 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 px-4 shadow-lg shadow-indigo-600/10 transition duration-200"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Entrar no Painel</span>
                )}
              </button>
            </form>

            {!firebaseActive && (
              <div className="pt-4 border-t border-slate-800 text-center space-y-2">
                <span className="block text-[10px] text-slate-500 font-medium">Acesso rápido de teste:</span>
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950/80 border border-indigo-900/50 px-3 py-1.5 rounded-xl transition"
                >
                  Preencher dados de Demonstração
                </button>
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-500 space-y-1">
            <p>© 2026 InCarsAds. Todos os direitos reservados.</p>
          </div>
        </div>
      </main>
    </div>
  );
}