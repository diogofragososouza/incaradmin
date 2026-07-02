{/* Insira este bloco no AdCard.tsx logo após o render do título: */}
{ad.description && (
  <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-slate-950/20 p-2 rounded border border-slate-800/40">
    {ad.description}
  </p>
)}