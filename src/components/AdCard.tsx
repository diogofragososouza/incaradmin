import React, { useState } from "react";
import { Ad } from "../types";
import { Trash2, Edit2, Play, Image, Clock, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";

interface AdCardProps {
  ad: Ad;
  onDelete: (id: string) => void | Promise<void>;
  onEdit: (ad: Ad) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  key?: string;
}

export default function AdCard({ 
  ad, 
  onDelete, 
  onEdit, 
  onMoveUp, 
  onMoveDown, 
  isFirst = false, 
  isLast = false 
}: AdCardProps): React.JSX.Element {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Formatar milissegundos para segundos
  const durationSec = (ad.durationMillis / 1000).toFixed(1).replace(".0", "");

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-lg shadow-slate-950/20">
      {/* Container de Mídia */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {!imageError ? (
          <img
            src={ad.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"}
            alt={ad.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800 text-slate-500">
            <Image size={32} className="mb-2" />
            <span className="text-xs">Falha ao carregar imagem</span>
          </div>
        )}

        {/* Badges de Tipo */}
        <div className="absolute top-3 left-3 flex gap-2">
          {ad.isVideo ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Play size={12} className="fill-white" />
              VÍDEO
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Image size={12} />
              IMAGEM
            </span>
          )}

          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/95 px-2.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700 backdrop-blur-sm">
            <Clock size={12} />
            {durationSec}s
          </span>
        </div>
      </div>

      {/* Detalhes do Anúncio */}
      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-semibold text-white text-base leading-snug line-clamp-2 min-h-[3rem] mb-2">
          {ad.title}
        </h4>

        {ad.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-slate-950/20 p-2 rounded border border-slate-800/40">
            {ad.description}
          </p>
        )}

        {ad.isVideo && ad.videoUrl && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
            <Play size={12} className="text-red-400 shrink-0" />
            <span className="truncate" title={ad.videoUrl}>{ad.videoUrl}</span>
            <a href={ad.videoUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300 shrink-0 ml-auto">
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="mt-auto pt-4 flex gap-2 border-t border-slate-800">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className={`flex items-center justify-center rounded-xl p-2.5 text-xs font-medium border transition-colors ${
                isFirst 
                  ? "bg-slate-950/10 border-slate-900 text-slate-700 cursor-not-allowed" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-indigo-400"
              }`}
              title="Mover para Cima"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className={`flex items-center justify-center rounded-xl p-2.5 text-xs font-medium border transition-colors ${
                isLast 
                  ? "bg-slate-950/10 border-slate-900 text-slate-700 cursor-not-allowed" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-indigo-400"
              }`}
              title="Mover para Baixo"
            >
              <ArrowDown size={14} />
            </button>
          </div>

          <button
            onClick={() => onEdit(ad)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2.5 px-3 text-xs font-medium transition-colors"
          >
            <Edit2 size={14} />
            Editar
          </button>

          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center justify-center rounded-xl bg-red-950/20 hover:bg-red-950/60 border border-red-900/40 hover:border-red-800 text-red-400 p-2.5 text-xs font-medium transition-colors"
              title="Excluir Anúncio"
            >
              <Trash2 size={14} />
            </button>
          ) : (
            <div className="flex gap-1 flex-1">
              <button
                onClick={() => {
                  if (ad.id) onDelete(ad.id);
                  setShowConfirmDelete(false);
                }}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white px-2 py-1.5 text-xs font-semibold transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1.5 text-xs font-medium border border-slate-700 transition-colors"
              >
                Não
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
