import { Plus } from "lucide-react";

export default function FloatingAction() {
  return (
    <button className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-2xl shadow-emerald-500/30 transition-all duration-200 btn-press hover:scale-110 hover:shadow-emerald-500/50 flex items-center justify-center">

      <Plus className="w-7 h-7 text-white" />

    </button>
  );
}
