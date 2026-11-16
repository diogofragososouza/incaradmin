import { AdScreen } from "../types";
import { MapPin, MonitorPlay, Radio } from "lucide-react";

interface AdScreensPanelProps {
  screens: AdScreen[];
  onlineScreens: AdScreen[];
  isFirebaseActive: boolean;
  isDemoUser: boolean;
  isLoading: boolean;
  error: string | null;
}

function formatTimestamp(timestamp: AdScreen["lastSeenAt"]): string {
  if (!timestamp) return "Horário indisponível";
  return timestamp.toDate().toLocaleString();
}

export default function AdScreensPanel({
  screens,
  onlineScreens,
  isFirebaseActive,
  isDemoUser,
  isLoading,
  error,
}: AdScreensPanelProps) {
  return (
    <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
            <MonitorPlay size={18} />
          </div>
          <div>
            <h2 className="font-bold text-white">Telas de Anúncios</h2>
            <p className="text-xs text-slate-400">
              Presença e última localização informada pelos aplicativos ativos
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-slate-950 px-3 py-1.5 border border-slate-800 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-300">{onlineScreens.length} online</span>
          <span className="text-slate-500">/ {screens.length} cadastradas</span>
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-800/50 bg-red-950/20 p-4 text-sm text-red-300">
          <p className="font-semibold">Não foi possível carregar as telas.</p>
          <p className="mt-1 text-xs text-red-300/80">{error}</p>
        </div>
      ) : !isFirebaseActive || isDemoUser ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
          Conecte-se ao Firebase e entre com uma conta administrativa para acompanhar as telas.
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
          Carregando dispositivos do Firestore...
        </div>
      ) : onlineScreens.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
          {screens.length === 0
            ? "Nenhum tablet reportou presença na coleção ad_screens."
            : "Nenhuma tela está online no momento."}
        </div>
      ) : (
        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {onlineScreens.map((screen) => {
            const mapUrl = screen.location
              ? `https://www.google.com/maps?q=${screen.location.latitude},${screen.location.longitude}`
              : null;

            return (
              <article
                key={screen.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Radio size={15} className="shrink-0 text-emerald-400" />
                    <h3 className="truncate text-sm font-semibold text-white">
                      {screen.deviceModel || `Tablet ${screen.deviceId.slice(0, 8)}`}
                    </h3>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                      Online
                    </span>
                  </div>
                  <p className="mt-1 truncate pl-[23px] font-mono text-[10px] text-slate-500">
                    ID: {screen.deviceId}
                  </p>
                  <p className="mt-1 pl-[23px] text-xs text-slate-400">
                    Visto por último: {formatTimestamp(screen.lastSeenAt)}
                    {screen.appVersion ? ` · App ${screen.appVersion}` : ""}
                    {screen.androidVersion ? ` · Android ${screen.androidVersion}` : ""}
                  </p>
                  {screen.currentAdId && (
                    <p className="mt-1 pl-[23px] text-xs text-slate-500">
                      Anúncio atual: <span className="font-mono">{screen.currentAdId}</span>
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-[23px] sm:pl-0">
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20"
                    >
                      <MapPin size={14} />
                      Ver localização
                      {typeof screen.location.accuracyMeters === "number" && (
                        <span className="text-indigo-300/70">
                          ±{Math.round(screen.location.accuracyMeters)}m
                        </span>
                      )}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-500">
                      <MapPin size={14} />
                      Localização indisponível
                    </span>
                  )}
                </div>
                {screen.location?.updatedAt && (
                  <p className="text-[11px] text-slate-500 sm:text-right">
                    GPS atualizado: {formatTimestamp(screen.location.updatedAt)}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
