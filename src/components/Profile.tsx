import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile, BloodGroup } from "../types";
import { User as UserIcon, Phone, Check, Loader2, Navigation } from "lucide-react";
import { motion } from "motion/react";

interface ProfileProps {
  user: User;
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export default function ProfileView({ user, profile, onProfileUpdate }: ProfileProps) {
  const [name, setName] = useState(profile?.name || "");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">(profile?.bloodGroup || "");
  const [phone, setPhone] = useState(profile?.phoneNumber || "");
  const [isDonor, setIsDonor] = useState(profile?.isDonor ?? false);
  const [isAvailable, setIsAvailable] = useState(profile?.isAvailable ?? true);
  const [lastDonation, setLastDonation] = useState(profile?.lastDonationDate || "");
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
          address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
        });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocating(false);
        alert("Could not get location. You can still save other details.");
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) return alert("Please select blood group");
    
    setLoading(true);
    const updatedProfile: UserProfile = {
      userId: user.uid,
      name,
      bloodGroup: bloodGroup as BloodGroup,
      phoneNumber: phone,
      isDonor,
      isAvailable,
      lastDonationDate: lastDonation,
      location: location || undefined,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "users", user.uid), updatedProfile);
      onProfileUpdate(updatedProfile);
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <UserIcon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-extrabold tracking-tight">Your Profile</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-border space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-4 h-5 w-5 text-text-muted" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-border bg-bg-slate py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Ex: Rahim Uddin"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Blood Group</label>
            <div className="grid grid-cols-4 gap-3">
              {bloodGroups.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`py-3 rounded-xl font-extrabold border-2 transition-all shadow-sm ${
                    bloodGroup === bg 
                    ? "bg-emergency border-emergency text-white" 
                    : "bg-white border-border text-text-main hover:border-primary/30"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-4 h-5 w-5 text-text-muted" />
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-xl border border-border bg-bg-slate py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="+880123456789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Current Location</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getLocation}
                disabled={locating}
                className="flex items-center gap-2 rounded-xl bg-white border border-border px-4 py-4 font-bold text-text-main hover:bg-bg-slate transition-all flex-1 shadow-sm"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                {location ? "Update Location" : "Tag Location"}
              </button>
            </div>
            {location && (
              <p className="text-xs text-donor font-extrabold px-1">
                ✓ GPS Coordinates Captured
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-text-main">Register as Donor</h3>
              <p className="text-xs font-medium text-text-muted">Join the elite network of donors</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isDonor}
                onChange={(e) => setIsDonor(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-7 w-12 rounded-full bg-border after:absolute after:top-[4px] after:left-[4px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-donor peer-checked:after:translate-x-5 peer-focus:outline-none"></div>
            </label>
          </div>

          {isDonor && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-6 pt-6 border-t border-border"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-main underline decoration-donor underline-offset-4">Available for donation?</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-7 w-12 rounded-full bg-border after:absolute after:top-[4px] after:left-[4px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-donor peer-checked:after:translate-x-5 peer-focus:outline-none"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Last Donation Date</label>
                <input
                  type="date"
                  value={lastDonation}
                  onChange={(e) => setLastDonation(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-bg-slate py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </motion.div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-70 uppercase tracking-widest"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
          Update Profile
        </button>
      </form>
    </div>
  );
}
