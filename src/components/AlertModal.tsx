import { EmergencyRequest } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, MapPin, Phone, X, ArrowRight } from "lucide-react";

interface AlertModalProps {
  request: EmergencyRequest | null;
  onClose: () => void;
  onView: () => void;
}

export default function AlertModal({ request, onClose, onView }: AlertModalProps) {
  if (!request) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-6 bg-black/40 backdrop-blur-[2px]">
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          className="w-full max-w-lg overflow-hidden rounded-2xl bg-[#111827] shadow-2xl border border-white/10"
        >
          <div className="p-4 md:p-6 flex items-center gap-4 text-white relative">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emergency"></span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black tracking-[0.2em] text-emergency uppercase">Urgent Request</span>
                <span className="text-[10px] font-bold text-white/40">• Just Now</span>
              </div>
              <p className="text-sm md:text-base font-bold truncate leading-tight">
                <span className="text-emergency font-black">{request.bloodGroup}</span> Needed Urgently
              </p>
              <p className="text-xs text-white/60 font-medium">Contact: {request.contactNumber}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onView}
                className="bg-white text-black text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-all"
              >
                Track
              </button>
              <button 
                onClick={onClose} 
                className="bg-white/10 text-white/60 p-2.5 rounded-lg hover:bg-white/20 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
