import React, { useState } from "react";
import { User } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile, BloodGroup, EmergencyRequest } from "../types";
import { AlertTriangle, MapPin, Phone, Loader2, Send } from "lucide-react";

interface RequestFormProps {
  user: User;
  profile: UserProfile | null;
  onComplete: () => void;
}

export default function RequestForm({ user, profile, onComplete }: RequestFormProps) {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [phone, setPhone] = useState(profile?.phoneNumber || "");
  const [urgency, setUrgency] = useState<"Low" | "Normal" | "Critical">("Normal");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState(profile?.location || null);

  const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: "Auto-detected Location"
        });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocating(false);
        alert("Could not get location. Ensure GPS is enabled.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) return alert("Select blood group");
    if (!location) return alert("Location is required for emergency requests");

    setLoading(true);
    const request: Omit<EmergencyRequest, 'id'> = {
      requesterId: user.uid,
      requesterName: profile?.name || "Request Member",
      bloodGroup: bloodGroup as BloodGroup,
      location,
      contactNumber: phone,
      urgency,
      status: "Active",
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "emergency_requests"), request);
      alert("Emergency request posted! Donors nearby will be alerted.");
      onComplete();
    } catch (err: any) {
      console.error(err);
      alert("Failed to post request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-emergency" />
        <h2 className="text-2xl font-extrabold text-emergency tracking-tight uppercase">Emergency Request</h2>
      </div>

      <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm shadow-red-50">
        <p className="text-sm text-red-800 font-bold italic">
          CRITICAL: This will notify all donors and mark a RED marker on the shared map. 
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-border space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Required Blood Group</label>
            <div className="grid grid-cols-4 gap-3">
              {bloodGroups.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`py-4 rounded-xl font-black border-2 transition-all shadow-sm ${
                    bloodGroup === bg 
                    ? "bg-emergency border-emergency text-white" 
                    : "bg-white border-border text-text-main hover:border-emergency/30"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Urgency Level</label>
            <div className="flex gap-3">
              {(["Low", "Normal", "Critical"] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgency(lvl)}
                  className={`flex-1 py-3 rounded-xl font-extrabold border-2 transition-all shadow-sm ${
                    urgency === lvl 
                    ? "bg-text-main border-text-main text-white" 
                    : "bg-white border-border text-text-main hover:border-text-main/50"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Map Location</label>
            <button
              type="button"
              onClick={getLocation}
              disabled={locating}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-extrabold transition-all border-2 ${
                location ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-bg-slate border-border text-text-muted hover:bg-white"
              }`}
            >
              {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
              {location 
                ? `✓ Location Pinset (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})` 
                : "Tag Emergency Location"
              }
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-4 h-5 w-5 text-text-muted" />
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-xl border border-border bg-bg-slate py-4 pl-12 pr-4 focus:ring-2 focus:ring-emergency outline-none transition-all"
                placeholder="Direct call number"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emergency py-5 font-black text-white shadow-xl shadow-emergency/20 transition-all hover:bg-red-800 disabled:opacity-70 uppercase tracking-widest"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          Broadcast Emergency
        </button>
      </form>
    </div>
  );
}
