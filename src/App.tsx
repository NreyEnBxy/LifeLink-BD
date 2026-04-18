import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { UserProfile, EmergencyRequest } from "./types";
import { MapPin, User as UserIcon, AlertCircle, Home as HomeIcon, LogOut, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Components
import AuthView from "./components/Auth";
import MapView from "./components/Map";
import ProfileView from "./components/Profile";
import RequestForm from "./components/RequestForm";
import HomeView from "./components/Home";
import AlertModal from "./components/AlertModal";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "map" | "request" | "profile">("home");
  const [loading, setLoading] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyRequest | null>(null);

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          // Fetch user profile
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            setActiveTab("profile"); // Force profile completion
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time Emergency Requests Listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "emergency_requests"),
      where("status", "==", "Active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const request = { id: change.doc.id, ...change.doc.data() } as EmergencyRequest;
          // Only show alert if it's new (created in the last 1 minute)
          const now = new Date().getTime();
          const createdAt = new Date(request.createdAt).getTime();
          if (now - createdAt < 60000 && request.requesterId !== user.uid) {
            setEmergencyAlert(request);
            // Play sound (using a public URL for a drop/alert sound)
            try {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
              audio.play().catch(e => console.log("Audio play blocked", e));
            } catch (e) {
              console.log("Audio failed", e);
            }
          }
        }
      });
    });

    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Droplets className="h-12 w-12 animate-bounce text-red-600" />
          <p className="font-medium text-gray-600 dark:text-gray-400">Loading LifeLink BD...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView onAuthSuccess={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeView profile={userProfile} onSwitchTab={setActiveTab} />;
      case "map":
        return <MapView userLocation={userProfile?.location} userProfile={userProfile} />;
      case "request":
        return <RequestForm user={user} profile={userProfile} onComplete={() => setActiveTab("map")} />;
      case "profile":
        return <ProfileView user={user} profile={userProfile} onProfileUpdate={setUserProfile} />;
      default:
        return <HomeView profile={userProfile} onSwitchTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-slate text-text-main flex flex-col pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="rounded bg-emergency px-2 py-1 text-white text-xs font-black">
            +
          </div>
          <h1 className="text-xl font-extrabold tracking-tighter text-primary uppercase">LifeLink BD</h1>
        </div>
        <div className="flex items-center gap-4">
          {userProfile?.isAvailable && (
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Available
            </div>
          )}
          <button 
            onClick={() => auth.signOut()}
            className="rounded-full p-2 text-text-muted hover:bg-bg-slate transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto container mx-auto p-6 md:max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-white px-2 h-16 shadow-lg">
        <NavBtn 
          active={activeTab === "home"} 
          onClick={() => setActiveTab("home")} 
          icon={<HomeIcon className="h-6 w-6" />} 
          label="Explore" 
        />
        <NavBtn 
          active={activeTab === "map"} 
          onClick={() => setActiveTab("map")} 
          icon={<MapPin className="h-6 w-6" />} 
          label="Live Map" 
        />
        <NavBtn 
          active={activeTab === "request"} 
          onClick={() => setActiveTab("request")} 
          icon={<AlertCircle className="h-6 w-6" />} 
          label="Request" 
        />
        <NavBtn 
          active={activeTab === "profile"} 
          onClick={() => setActiveTab("profile")} 
          icon={<UserIcon className="h-6 w-6" />} 
          label="My Profile" 
        />
      </nav>

      {/* Emergency Alert Modal */}
      {emergencyAlert && (
         <AlertModal 
           request={emergencyAlert} 
           onClose={() => setEmergencyAlert(null)} 
           onView={() => {
             setEmergencyAlert(null);
             setActiveTab("map");
           }}
         />
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors px-4 py-1.5 rounded-xl ${
        active ? "text-primary" : "text-text-muted"
      }`}
    >
      {icon}
      <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
    </button>
  );
}
