import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex min-h-52 items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3 rounded-wellness border border-white/80 bg-white px-8 py-7 text-center shadow-card">
        <Loader2 className="h-7 w-7 animate-spin text-wellness-aqua" />
        <p className="text-sm font-semibold text-wellness-slate">{message}</p>
      </div>
    </div>
  );
}
