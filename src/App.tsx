import { useState, useEffect, useRef, FormEvent } from "react";
import { Ad, FirebaseConfig } from "./types";
import { INITIAL_DEMO_ADS } from "./data";
import { initializeFirebase } from "./lib/firebase";
import AdCard from "./components/AdCard";
import ConfigPanel from "./components/ConfigPanel";
import MetricCard from "./components/MetricCard";
import LoginScreen from "./components/LoginScreen";
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Code, 
  Copy, 
  Check, 
  Search, 
  Video, 
  Image as ImageIcon, 
  Clock, 
  FolderOpen,
  MonitorPlay,
  Settings,
  LogOut
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  getDocs,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

export default function App() {
  // Configuração e Conexão Firebase
  const [config, setConfig] = useState<FirebaseConfig | null>(null);
  const [firebaseActive, setFirebaseActive] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const firestoreDbRef = useRef<any>(null);

  // Autenticação
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const firebaseAuthRef = useRef<any>(null);

  // Lista de Anúncios e Filtros
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");

  // Estado do Formulário
  const [formId, setFormId] = useState<string | undefined>(undefined);
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsVideo, setFormIsVideo] = useState(false);
  const [formDurationSec, setFormDurationSec] = useState(10); // exibido em segundos, convertido para millis no salvamento
  const [isEditing, setIsEditing] = useState(false);

  // Interface/Modais auxiliares
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showNotification, setShowNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // 1. Carregar Configuração Salva e Inicializar Modo Adequado
  useEffect(() => {
    // Restaurar usuário demo se aplicável
    const demoUser = localStorage.getItem("demo_admin_user");
    if (demoUser) {
      setUser({ email: demoUser, isDemo: true });
    }

    const savedConfig = localStorage.getItem("firebase_admin_ad_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig) as FirebaseConfig;
        if (parsed && parsed.apiKey && parsed.projectId) {
          setConfig(parsed);
          handleConnectFirebase(parsed);
          return;
        }
      } catch (e) {
        console.error("Erro ao carregar config salva:", e);
      }
    }

    // Caso não haja configuração salva, inicializa com dados demo locais
    loadDemoAds();
  }, []);

  // Carrega anúncios locais
  const loadDemoAds = () => {
    setFirebaseActive(false);
    const localSaved = localStorage.getItem("local_demo_ads");
    if (localSaved) {
      try {
        setAds(JSON.parse(localSaved));
      } catch (e) {
        setAds(INITIAL_DEMO_ADS);
      }
    } else {
      setAds(INITIAL_DEMO_ADS);
      localStorage.setItem("local_demo_ads", JSON.stringify(INITIAL_DEMO_ADS));
    }
  };

  // 2. Conectar ao Firestore de Verdade
  const handleConnectFirebase = (newConfig: FirebaseConfig | null) => {
    if (!newConfig) {
      // Desconectar e voltar para demo
      localStorage.removeItem("firebase_admin_ad_config");
      setConfig(null);
      setConnectionError(null);
      loadDemoAds();
      
      // Se estava logado no firebase real, limpar sessão
      if (user && !user.isDemo) {
        setUser(null);
      }
      
      triggerNotification("success", "Desconectado do Firestore. Modo demo ativo.");
      return;
    }

    try {
      setConnectionError(null);
      const { db, auth } = initializeFirebase(newConfig);
      firestoreDbRef.current = db;
      firebaseAuthRef.current = auth;

      // Guardar config no localStorage
      localStorage.setItem("firebase_admin_ad_config", JSON.stringify(newConfig));
      setConfig(newConfig);

      // Escutar estado de autenticação real do Firebase Auth
      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Se não houver usuário real logado, limpa do estado se for o caso
          if (user && !user.isDemo) {
            setUser(null);
          }
        }
      });

      // Ouvir atualizações em tempo real do Firestore (coleção 'active_ads')
      const adsCollectionRef = collection(db, "active_ads");
      const q = query(adsCollectionRef);

      const unsubscribeAds = onSnapshot(
        q,
        (snapshot) => {
          const fetchedAds: Ad[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "",
              imageUrl: data.imageUrl || "",
              videoUrl: data.videoUrl || "",
              isVideo: !!data.isVideo,
              durationMillis: typeof data.durationMillis === "number" ? data.durationMillis : 10000,
              description: data.description || "",
              createdAt: data.createdAt || null
            };
          });

          // Ordenar localmente por ID ou título como fallback
          fetchedAds.sort((a, b) => b.title.localeCompare(a.title));

          setAds(fetchedAds);
          setFirebaseActive(true);
          setConnectionError(null);
        },
        (error) => {
          console.error("Erro no onSnapshot do Firestore:", error);
          setConnectionError(
            `Erro ao conectar com a coleção 'active_ads': ${error.message}. Certifique-se de que a coleção existe e as regras de segurança permitem leitura/escrita.`
          );
          setFirebaseActive(false);
        }
      );

      return () => {
        unsubscribeAuth();
        unsubscribeAds();
      };
    } catch (err: any) {
      console.error("Erro de inicialização do Firebase:", err);
      setConnectionError(`Falha ao inicializar o Firebase: ${err.message}`);
      setFirebaseActive(false);
    }
  };

  // Função para lidar com o login do admin
  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (firebaseActive && firebaseAuthRef.current) {
        // Login com Firebase real
        await signInWithEmailAndPassword(firebaseAuthRef.current, email, password);
        triggerNotification("success", "Login efetuado com sucesso (Firebase Real)!");
      } else {
        // Login de demonstração local
        if (email === "admin@incarsads.com" && password === "admin123") {
          setUser({ email, isDemo: true });
          localStorage.setItem("demo_admin_user", email);
          triggerNotification("success", "Acesso concedido como Administrador de Demonstração!");
        } else {
          throw new Error("E-mail ou senha incorretos para o modo demonstração. Dica: use admin@incarsads.com / admin123");
        }
      }
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      let friendlyMessage = err.message;
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        friendlyMessage = "E-mail ou senha incorretos. Certifique-se de ter cadastrado este usuário no console do Firebase.";
      }
      setAuthError(friendlyMessage);
      triggerNotification("error", friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (firebaseActive && firebaseAuthRef.current) {
        await signOut(firebaseAuthRef.current);
      }
      setUser(null);
      localStorage.removeItem("demo_admin_user");
      triggerNotification("success", "Sessão encerrada com sucesso.");
    } catch (err: any) {
      console.error("Erro no logout:", err);
      triggerNotification("error", `Erro ao sair: ${err.message}`);
    }
  };

  // Utilitário de Notificação
  const triggerNotification = (type: "success" | "error", message: string) => {
    setShowNotification({ type, message });
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // 3. Salvar Anúncio (Criar ou Atualizar)
  const handleSaveAd = async (e: FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      triggerNotification("error", "O título do anúncio é obrigatório.");
      return;
    }
    if (!formImageUrl.trim()) {
      triggerNotification("error", "A URL da imagem é obrigatória.");
      return;
    }

    const durationMillis = Math.max(1000, Math.round(formDurationSec * 1000));

    const adData: Omit<Ad, "id"> = {
      title: formTitle.trim(),
      imageUrl: formImageUrl.trim(),
      videoUrl: formIsVideo ? formVideoUrl.trim() : "",
      isVideo: formIsVideo,
      durationMillis: durationMillis,
      description: formDescription.trim(),
    };

    try {
      if (firebaseActive && firestoreDbRef.current) {
        // Operação Real no Firestore na coleção 'active_ads'
        const adsCol = collection(firestoreDbRef.current, "active_ads");
        if (isEditing && formId) {
          const adDocRef = doc(firestoreDbRef.current, "active_ads", formId);
          await updateDoc(adDocRef, adData);
          triggerNotification("success", "Anúncio atualizado com sucesso no Firestore!");
        } else {
          await addDoc(adsCol, {
            ...adData,
            createdAt: serverTimestamp()
          });
          triggerNotification("success", "Novo anúncio inserido com sucesso no Firestore!");
        }
      } else {
        // Modo Demo Local (Salvar no LocalStorage)
        let updatedList = [...ads];
        if (isEditing && formId) {
          updatedList = updatedList.map((item) => 
          item.id === formId ? { ...item, ...adData } : item
          );
          triggerNotification("success", "Anúncio atualizado localmente (Modo Demo).");
        } else {
          const newDemoAd: Ad = {
            id: `demo-${Date.now()}`,
            ...adData,
            createdAt: Date.now()
          };
          updatedList = [newDemoAd, ...updatedList];
          triggerNotification("success", "Novo anúncio cadastrado localmente (Modo Demo).");
        }
        setAds(updatedList);
        localStorage.setItem("local_demo_ads", JSON.stringify(updatedList));
      }

      // Resetar Form
      resetForm();
    } catch (err: any) {
      console.error("Erro ao salvar anúncio:", err);
      triggerNotification("error", `Erro ao salvar anúncio: ${err.message}`);
    }
  };

  // Editar Anúncio
  const handleEditSelect = (ad: Ad) => {
    setFormId(ad.id);
    setFormTitle(ad.title);
    setFormImageUrl(ad.imageUrl);
    setFormVideoUrl(ad.videoUrl || "");
    setFormDescription(ad.description || "");
    setFormIsVideo(ad.isVideo);
    setFormDurationSec(ad.durationMillis / 1000);
    setIsEditing(true);

    // Scrollar suave para o form
    const formEl = document.getElementById("manual-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cancelar Edição
  const resetForm = () => {
    setFormId(undefined);
    setFormTitle("");
    setFormImageUrl("");
    setFormVideoUrl("");
    setFormDescription("");
    setFormIsVideo(false);
    setFormDurationSec(10);
    setIsEditing(false);
  };

  // 4. Deletar Anúncio
  const handleDeleteAd = async (id: string) => {
    try {
      if (firebaseActive && firestoreDbRef.current) {
        const adDocRef = doc(firestoreDbRef.current, "active_ads", id);
        await deleteDoc(adDocRef);
        triggerNotification("success", "Anúncio excluído permanentemente do Firestore!");
      } else {
        const updatedList = ads.filter((item) => item.id !== id);
        setAds(updatedList);
        localStorage.setItem("local_demo_ads", JSON.stringify(updatedList));
        triggerNotification("success", "Anúncio removido localmente.");
      }
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      triggerNotification("error", `Erro ao excluir: ${err.message}`);
    }
  };

  // Semear dados de demonstração no banco de dados Firestore real se solicitado
  const handleSeedFirestore = async () => {
    if (!firebaseActive || !firestoreDbRef.current) return;
    if (confirm("Isso irá criar 4 anúncios de demonstração diretamente na sua coleção 'active_ads' do Firestore. Deseja prosseguir?")) {
      try {
        const batch = writeBatch(firestoreDbRef.current);
        const adsCol = collection(firestoreDbRef.current, "active_ads");

        for (const demoAd of INITIAL_DEMO_ADS) {
          const { id, ...adDataWithoutId } = demoAd;
          const newDocRef = doc(adsCol);
          batch.set(newDocRef, {
            ...adDataWithoutId,
            createdAt: serverTimestamp()
          });
        }

        await batch.commit();
        triggerNotification("success", "4 Anúncios de demonstração semeados no seu Firestore!");
      } catch (e: any) {
        console.error("Erro ao semear banco de dados:", e);
        triggerNotification("error", `Erro ao semear banco: ${e.message}`);
      }
    }
  };

  // Copiar código de integração para o Clipboard
  const handleCopyCode = () => {
    const code = `// Estrutura do Documento / Modelo de Dados
data class Ad(
    val id: String = "",
    val title: String = "",
    val imageUrl: String = "",
    val videoUrl: String = "",
    val isVideo: Boolean = false,
    val durationMillis: Long = 10000L,
    val description: String = ""
)

// Ouvinte em tempo real no app Android
val db = Firebase.firestore
db.collection("active_ads")
    .addSnapshotListener { snapshots, e ->
        if (e != null) {
            Log.w("AdAdmin", "Falha ao ouvir anúncios.", e)
            return@addSnapshotListener
        }
        
        val adsList = ArrayList<Ad>()
        for (doc in snapshots!!) {
            val ad = Ad(
                id = doc.id,
                title = doc.getString("title") ?: "",
                imageUrl = doc.getString("imageUrl") ?: "",
                videoUrl = doc.getString("videoUrl") ?: "",
                isVideo = doc.getBoolean("isVideo") ?: false,
                durationMillis = doc.getLong("durationMillis") ?: 10000L,
                description = doc.getString("description") ?: ""
            )
            adsList.add(ad)
        }
        
        // Exibir anúncios no tablet automotivo / aplicativo Android
        updateAdvertisingDisplay(adsList)
    }`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtrar anúncios para exibição
  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === "all") return matchesSearch;
    if (filterType === "video") return matchesSearch && ad.isVideo;
    if (filterType === "image") return matchesSearch && !ad.isVideo;
    return matchesSearch;
  });

  // Métricas
  const totalAds = ads.length;
  const videoAdsCount = ads.filter((a) => a.isVideo).length;
  const imageAdsCount = totalAds - videoAdsCount;
  const avgDurationMillis = totalAds > 0 ? Math.round(ads.reduce((acc, curr) => acc + curr.durationMillis, 0) / totalAds) : 0;
  const avgDurationSec = (avgDurationMillis / 1000).toFixed(1);

  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        firebaseActive={firebaseActive}
        connectionError={connectionError}
        config={config}
        onConnectFirebase={handleConnectFirebase}
        isLoading={authLoading}
        authError={authError}
        setAuthError={setAuthError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* Banner de Notificação Flutuante */}
      {showNotification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl transition-all duration-300 animate-bounce ${
          showNotification.type === "success" 
            ? "bg-slate-900 border-emerald-500/40 text-emerald-400" 
            : "bg-slate-900 border-red-500/40 text-red-400"
        }`}>
          {showNotification.type === "success" ? (
            <CheckCircle className="shrink-0 text-emerald-400" size={20} />
          ) : (
            <AlertTriangle className="shrink-0 text-red-400" size={20} />
          )}
          <span className="text-xs font-semibold">{showNotification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
              <MonitorPlay className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Painel Admin de Anúncios
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                  Android V1.4
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Gerencie e cadastre campanhas de anúncios em tempo real para seus dispositivos em trânsito.
              </p>
            </div>
          </div>

          {/* Usuário Autenticado e Botão de Sair */}
          <div className="flex items-center gap-3.5">
            <div className="text-right hidden sm:block">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operador Autenticado</span>
              <span className="block text-xs font-medium text-slate-300 font-mono">
                {user.email}
                {user.isDemo && <span className="text-[10px] text-amber-500 font-bold ml-1.5">(DEMO)</span>}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-red-400 py-2.5 px-4 text-xs font-semibold transition duration-150"
              title="Encerrar Sessão"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* Top Segment: Config Panel and Analytics Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Configuração do Firestore */}
          <div className="lg:col-span-1">
            <ConfigPanel 
              config={config} 
              onSaveConfig={handleConnectFirebase} 
              isFirebaseActive={firebaseActive}
              connectionError={connectionError}
            />
          </div>

          {/* Card 2: Analytics & Metrics Banner */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard 
              title="Total de Anúncios" 
              value={totalAds} 
              icon={<FolderOpen className="text-indigo-400" size={18} />} 
              description={firebaseActive ? "Lidos em tempo real do Firestore" : "Ativos na memória local"}
              colorClass="from-indigo-600/20 to-violet-600/20 text-indigo-400"
            />
            <MetricCard 
              title="Mídias Integradas" 
              value={`${imageAdsCount} Img | ${videoAdsCount} Vídeos`} 
              icon={<Video className="text-emerald-400" size={18} />} 
              description={`${videoAdsCount > 0 ? ((videoAdsCount / totalAds) * 100).toFixed(0) : 0}% de conteúdo dinâmico`}
              colorClass="from-emerald-600/20 to-teal-600/20 text-emerald-400"
            />
            <MetricCard 
              title="Duração Média" 
              value={`${avgDurationSec}s`} 
              icon={<Clock className="text-amber-400" size={18} />} 
              description="Ideal para tráfego urbano"
              colorClass="from-amber-600/20 to-orange-600/20 text-amber-400"
            />
          </div>

        </div>

        {/* Middle Segment: Form side-by-side with Ad List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Col 1: Formulário de Cadastro Manual */}
          <div className="lg:col-span-4">
            
            {/* Box: Formulário Manual */}
            <div id="manual-form" className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl scroll-mt-20">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Plus className="text-indigo-400" size={18} />
                  <h3 className="text-base font-bold text-white">
                    {isEditing ? "Editar Anúncio" : "Cadastrar Novo Anúncio"}
                  </h3>
                </div>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveAd} className="space-y-4">
                
                {/* Título do Anúncio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Título do Anúncio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Rodízio de Pizza Bella Itália"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 text-xs text-slate-200 focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* URL da Imagem */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    URL da Imagem de Banner <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 text-xs text-slate-200 focus:outline-none transition-colors font-mono"
                    required
                  />
                  {formImageUrl && (
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2 bg-slate-950/40 p-1.5 rounded border border-slate-800">
                      <span className="truncate">Preview da mídia:</span>
                      <a href={formImageUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1 shrink-0">
                        Verificar link
                      </a>
                    </div>
                  )}
                </div>

                {/* Descrição do Anúncio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Descrição / Observação do Anúncio
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Campanha de desconto especial para exibição diurna nos tablets."
                    rows={2}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 text-xs text-slate-200 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Seleção se é Vídeo ou Imagem */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Video className="text-slate-400" size={16} />
                    <div>
                      <span className="block text-xs font-semibold text-white">Anúncio de Vídeo?</span>
                      <span className="block text-[10px] text-slate-500">Marque se esta campanha possui um arquivo de vídeo</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsVideo}
                      onChange={(e) => setFormIsVideo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* URL do Vídeo - exibida somente se isVideo for verdadeiro */}
                {formIsVideo && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      URL do Vídeo (MP4, HLS, etc.)
                    </label>
                    <input
                      type="url"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="https://exemplo.com/meu-video.mp4"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 text-xs text-slate-200 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                )}

                {/* Duração em Segundos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      Duração de Exibição
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {formDurationSec} segundos ({formDurationSec * 1000} ms)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    step="1"
                    value={formDurationSec}
                    onChange={(e) => setFormDurationSec(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>3s (rápido)</span>
                    <span>30s (ideal)</span>
                    <span>60s (longo)</span>
                  </div>
                </div>

                {/* Botão de Enviar */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 px-4 shadow-lg transition duration-200"
                >
                  <Plus size={16} />
                  {isEditing ? "Salvar Alterações" : "Inserir Anúncio"}
                </button>

              </form>
            </div>

          </div>

          {/* Col 2: Filtros e Lista de Anúncios Ativos */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bloco de Busca, Filtro e Tabela */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Campanhas Ativas
                    <span className="text-[11px] bg-slate-950 text-slate-400 font-normal px-2.5 py-0.5 rounded-full border border-slate-800">
                      Exibindo {filteredAds.length} anúncios
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Anúncios transmitidos em tempo real para os dispositivos embarcados.</p>
                </div>

                {/* Semeador de testes no Firestore real */}
                {firebaseActive && ads.length === 0 && (
                  <button
                    onClick={handleSeedFirestore}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-500/40 hover:border-indigo-500 bg-indigo-950/20 text-indigo-300 hover:text-white transition shrink-0"
                  >
                    Semear Banco de Testes
                  </button>
                )}
              </div>

              {/* Filtros e Busca */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                
                {/* Input de Busca */}
                <div className="md:col-span-7 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar anúncio por título..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>

                {/* Filtro de Tipo (Imagem/Vídeo) */}
                <div className="md:col-span-5 flex rounded-xl bg-slate-950 border border-slate-800 p-1">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filterType === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterType("image")}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filterType === "image" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Imagens
                  </button>
                  <button
                    onClick={() => setFilterType("video")}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filterType === "video" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Vídeos
                  </button>
                </div>

              </div>

              {/* Lista em Grid de Cards */}
              {filteredAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAds.map((ad) => (
                    <AdCard 
                      key={ad.id} 
                      ad={ad} 
                      onDelete={handleDeleteAd} 
                      onEdit={handleEditSelect} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
                  <ImageIcon size={40} className="text-slate-600 mb-3" />
                  <h4 className="text-sm font-semibold text-slate-300">Nenhum anúncio encontrado</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Experimente alterar os filtros de pesquisa, digite uma ideia de campanha no assistente Gemini para gerar um anúncio inteligente, ou cadastre manualmente.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Bottom Segment: Android Integration Code Helper */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <button
            onClick={() => setShowAndroidGuide(!showAndroidGuide)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-800/20 text-left transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                <Code size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Guia de Integração Android (Kotlin)</h3>
                <p className="text-xs text-slate-400">Veja como sincronizar seu tablet automotivo ou app móvel com esta coleção Firestore.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              {showAndroidGuide ? "Ocultar Código" : "Exibir Código"}
            </span>
          </button>

          {showAndroidGuide && (
            <div className="p-6 bg-slate-950 border-t border-slate-800 animate-fade-in relative">
              <div className="absolute right-6 top-6">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition"
                >
                  {copiedCode ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copiar Código
                    </>
                  )}
                </button>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Passo 1: Definir o modelo de dados e o ouvinte</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Para que os anúncios apareçam de forma automática e em tempo real na tela do seu aplicativo, configure o <code className="font-mono text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">addSnapshotListener</code> do Firestore conectando-se diretamente à coleção <code className="font-mono text-indigo-400 bg-slate-900 px-1 py-0.5 rounded">ads</code>:
                </p>
              </div>

              <pre className="text-xs font-mono bg-[#070b13] p-4 rounded-xl border border-slate-800 overflow-x-auto text-slate-300">
                {`// Estrutura do Documento / Modelo de Dados
data class Ad(
    val id: String = "",
    val title: String = "",
    val imageUrl: String = "",
    val videoUrl: String = "",
    val isVideo: Boolean = false,
    val durationMillis: Long = 10000L
)

// Ouvinte em tempo real no app Android
val db = Firebase.firestore
db.collection("ads")
    .addSnapshotListener { snapshots, e ->
        if (e != null) {
            Log.w("AdAdmin", "Falha ao ouvir anúncios.", e)
            return@addSnapshotListener
        }
        
        val adsList = ArrayList<Ad>()
        for (doc in snapshots!!) {
            val ad = Ad(
                id = doc.id,
                title = doc.getString("title") ?: "",
                imageUrl = doc.getString("imageUrl") ?: "",
                videoUrl = doc.getString("videoUrl") ?: "",
                isVideo = doc.getBoolean("isVideo") ?: false,
                durationMillis = doc.getLong("durationMillis") ?: 10000L
            )
            adsList.add(ad)
        }
        
        // Exibir anúncios no tablet automotivo / aplicativo Android
        updateAdvertisingDisplay(adsList)
    }`}
              </pre>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/40 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            <span>&copy; 2026 Painel Admin de Anúncios. Desenvolvido para integração Firestore Real e Android.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-600 font-mono">Port: 3000 (Ingress Active)</span>
            <span className="text-slate-600 font-mono">SDK: @google/genai ^2.4.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
