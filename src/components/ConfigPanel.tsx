import { useState, useEffect, FormEvent } from "react";
import { FirebaseConfig } from "../types";
import { Settings, Save, Wifi, WifiOff, HelpCircle, Check, Loader2 } from "lucide-react";

interface ConfigPanelProps {
  config: FirebaseConfig | null;
  onSaveConfig: (newConfig: FirebaseConfig | null) => void;
  isFirebaseActive: boolean;
  connectionError: string | null;
}

export default function ConfigPanel({ config, onSaveConfig, isFirebaseActive, connectionError }: ConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [messagingSenderId, setMessagingSenderId] = useState("");
  const [appId, setAppId] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Carregar os valores de configuração quando o componente for montado ou alterado externamente
  useEffect(() => {
    if (config) {
      setApiKey(config.apiKey || "");
      setAuthDomain(config.authDomain || "");
      setProjectId(config.projectId || "");
      setStorageBucket(config.storageBucket || "");
      setMessagingSenderId(config.messagingSenderId || "");
      setAppId(config.appId || "");
    }
  }, [config]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId || !appId) {
      alert("Por favor, preencha os campos obrigatórios (API Key, Project ID e App ID) para conectar.");
      return;
    }

    const newConfig: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    onSaveConfig(newConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDisconnect = () => {
    if (confirm("Deseja realmente desconectar do Firestore e voltar ao Modo Demonstração local?")) {
      setApiKey("");
      setAuthDomain("");
      setProjectId("");
      setStorageBucket("");
      setMessagingSenderId("");
      setAppId("");
      onSaveConfig(null);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Settings className="text-indigo-400" size={20} />
          <h3 className="text-lg font-bold text-white">Conexão Firestore</h3>
        </div>

        {/* Status de Conexão */}
        <div className="flex items-center gap-1.5">
          {isFirebaseActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              FIRESTORE REAL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              DEMO (LOCAL)
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        {isFirebaseActive 
          ? "Você está conectado ao seu banco de dados Firestore de produção. Todas as alterações refletirão diretamente no app Android na coleção 'ads'." 
          : "Armazenando dados localmente no navegador. Configure as credenciais do seu Firebase para conectar com a coleção 'ads' em produção."
        }
      </p>

      {connectionError && (
        <div className="mb-4 rounded-xl bg-red-950/20 border border-red-800/40 p-3 text-xs text-red-400">
          <strong>Erro de Conexão:</strong> {connectionError}
        </div>
      )}

      {/* Botão de abrir/fechar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-center text-xs py-2 px-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 text-slate-300 font-medium transition"
      >
        {isOpen ? "Ocultar Campos de Credencial" : "Exibir Credenciais do Firebase"}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                API Key <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Project ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="meu-app-android"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                App ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456:web:abcd"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="meu-app-android.firebaseapp.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Storage Bucket
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="meu-app-android.appspot.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Messaging Sender ID
              </label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="1234567890"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 transition-all duration-200"
            >
              {saveSuccess ? (
                <>
                  <Check size={14} />
                  Salvo com sucesso!
                </>
              ) : (
                <>
                  <Save size={14} />
                  Salvar e Conectar
                </>
              )}
            </button>

            {isFirebaseActive && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="rounded-xl border border-red-900/40 hover:border-red-800 bg-red-950/20 hover:bg-red-950/50 text-red-400 font-semibold text-xs py-2.5 px-4 transition-all"
              >
                Voltar para Modo Demo
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
