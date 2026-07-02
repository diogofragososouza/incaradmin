import { useState, useEffect, FormEvent } from "react";
import { FirebaseConfig } from "../types";
import { Settings, Save, Wifi, WifiOff, HelpCircle, Check, Loader2, Sparkles } from "lucide-react";

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
  const [rawConfigPaste, setRawConfigPaste] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Limpa as aspas e caracteres indesejados ao salvar/ler credenciais
  const cleanValue = (val: string): string => {
    let cleaned = val.trim();
    // Remove aspas no início/fim
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
      (cleaned.startsWith("`") && cleaned.endsWith("`"))
    ) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    // Remove vírgulas ou ponto-e-vírgula no fim (comum ao copiar de objeto JS)
    if (cleaned.endsWith(",") || cleaned.endsWith(";")) {
      cleaned = cleaned.slice(0, -1).trim();
    }
    // Segunda passagem de aspas caso tivessem ficado ocultas
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    return cleaned;
  };

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

  // Função para processar o bloco de texto colado e preencher os campos automaticamente
  const handleQuickPasteChange = (text: string) => {
    setRawConfigPaste(text);
    if (!text.trim()) return;

    // Regex para buscar o par de chave-valor (ex: apiKey: "valor", "apiKey": 'valor')
    const extract = (key: string): string => {
      const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"\`]([^'"\`]+)['"\`]`, "i");
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
      return "";
    };

    const extApiKey = extract("apiKey");
    const extAuthDomain = extract("authDomain");
    const extProjectId = extract("projectId");
    const extStorageBucket = extract("storageBucket");
    const extMessagingSenderId = extract("messagingSenderId");
    const extAppId = extract("appId");

    let filledSomething = false;
    if (extApiKey) { setApiKey(extApiKey); filledSomething = true; }
    if (extAuthDomain) { setAuthDomain(extAuthDomain); filledSomething = true; }
    if (extProjectId) { setProjectId(extProjectId); filledSomething = true; }
    if (extStorageBucket) { setStorageBucket(extStorageBucket); filledSomething = true; }
    if (extMessagingSenderId) { setMessagingSenderId(extMessagingSenderId); filledSomething = true; }
    if (extAppId) { setAppId(extAppId); filledSomething = true; }

    if (filledSomething) {
      // Pequeno feedback de autofill
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const cleanedApiKey = cleanValue(apiKey);
    const cleanedProjectId = cleanValue(projectId);
    const cleanedAppId = cleanValue(appId);

    if (!cleanedApiKey || !cleanedProjectId || !cleanedAppId) {
      alert("Por favor, preencha os campos obrigatórios (API Key, Project ID e App ID) para conectar.");
      return;
    }

    const newConfig: FirebaseConfig = {
      apiKey: cleanedApiKey,
      authDomain: cleanValue(authDomain),
      projectId: cleanedProjectId,
      storageBucket: cleanValue(storageBucket),
      messagingSenderId: cleanValue(messagingSenderId),
      appId: cleanedAppId
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
          {/* Quick Paste Block */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950/40">
            <label className="block text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1">
              <Sparkles className="animate-pulse text-indigo-400" size={13} />
              Preenchimento Automático Rápido (Recomendado)
            </label>
            <p className="text-[10px] text-slate-500 mb-2 leading-tight">
              Cole o objeto <code className="text-indigo-400 bg-indigo-950/30 px-1 py-0.5 rounded">const firebaseConfig = &#123;...&#125;</code> completo do seu painel Firebase para autocompletar os campos sem erros.
            </p>
            <textarea
              value={rawConfigPaste}
              onChange={(e) => handleQuickPasteChange(e.target.value)}
              placeholder="Cole aqui o seu código do Firebase Console contendo apiKey, authDomain, projectId, etc..."
              rows={3}
              className="w-full rounded-xl bg-[#090d16] border border-slate-800 focus:border-indigo-500 p-2 text-xs text-slate-300 focus:outline-none transition-all placeholder:text-slate-600 font-mono resize-none"
            />
            {rawConfigPaste && (
              <div className="mt-1.5 text-[10px] text-emerald-400 font-medium">
                ✨ Processado e limpo! Verifique os valores gerados nos campos individuais abaixo.
              </div>
            )}
          </div>

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
