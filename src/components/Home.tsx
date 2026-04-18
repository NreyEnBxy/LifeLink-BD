import React from "react";
import { UserProfile } from "../types";
import { HandHelping, Droplets, Map as MapIcon, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HomeProps {
  profile: UserProfile | null;
  onSwitchTab: (tab: "home" | "map" | "request" | "profile") => void;
}

export default function HomeView({ profile, onSwitchTab }: HomeProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-text-main tracking-tight">Hello, {profile?.name || "Member"}</h2>
          <p className="text-text-muted text-sm font-medium">Welcome to LifeLink BD</p>
        </div>
        {profile?.bloodGroup && (
          <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-white border border-border text-emergency shadow-sm">
            <span className="text-[10px] font-bold leading-none uppercase tracking-tighter opacity-70">Group</span>
            <span className="text-2xl font-black">{profile.bloodGroup}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <QuickAction 
          color="bg-primary" 
          icon={<Droplets />} 
          title="Need Blood" 
          subtitle="Post emergency"
          onClick={() => onSwitchTab("request")}
        />
        <QuickAction 
          color="bg-donor" 
          icon={<MapIcon />} 
          title="Find Donors" 
          subtitle="View Map"
          onClick={() => onSwitchTab("map")}
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-bg-slate text-text-muted rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted">Donor Status</h3>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-3">
            <Heart className={`h-5 w-5 ${profile?.isDonor ? "text-donor fill-donor" : "text-text-muted"}`} />
            <span className="font-bold text-emerald-900">{profile?.isDonor ? "You are a Verified Donor" : "Become a Life Saver"}</span>
          </div>
          <button 
            onClick={() => onSwitchTab("profile")}
            className="text-primary text-sm font-bold flex items-center gap-1"
          >
            {profile?.isDonor ? "Manage" : "Sign Up"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-300">Community Impact</h3>
        <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-6 text-white shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <span className="text-3xl font-black italic">100% Free</span>
              <p className="text-xs opacity-80 uppercase font-bold tracking-widest">Always & Forever</p>
            </div>
            <HandHelping className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-sm italic font-medium">"One unit of blood can save up to three lives. Thank you for being a part of this network."</p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="font-bold">Emergency Tips</h3>
        <div className="grid grid-cols-1 gap-3">
          <Tip title="Keep your phone active after posting a request." />
          <Tip title="Donors should wait 4 months between donations." />
          <Tip title="Always verify donor identity before procedures." />
        </div>
      </section>
    </div>
  );
}

function QuickAction({ color, icon, title, subtitle, onClick }: { color: string, icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${color} flex flex-col items-start p-6 rounded-2xl text-white shadow-md transition-all text-left w-full h-36 relative overflow-hidden`}
    >
      <div className="p-2 bg-white/10 rounded-lg mb-3">
        {icon}
      </div>
      <span className="font-extrabold text-xl leading-none mb-1">{title}</span>
      <span className="text-[10px] uppercase font-bold opacity-70 tracking-widest">{subtitle}</span>
      <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
        {icon && <div className="w-32 h-32">{icon}</div>}
      </div>
    </motion.button>
  );
}

function Tip({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl text-sm">
      <div className="h-2 w-2 rounded-full bg-emergency"></div>
      <p className="text-text-main font-medium">{title}</p>
    </div>
  );
}
