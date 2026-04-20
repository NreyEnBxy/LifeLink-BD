import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile, EmergencyRequest, GeoLocation } from "../types";
import { Phone, Clock, AlertCircle } from "lucide-react";

// Use CDN icons to avoid module resolution issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const DonorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RequestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  userLocation?: GeoLocation;
  userProfile?: UserProfile | null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapView({ userLocation, userProfile }: MapProps) {
  const [donors, setDonors] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [filter, setFilter] = useState<string>("All");

  const center: [number, number] = userLocation ? [userLocation.latitude, userLocation.longitude] : [23.8103, 90.4125]; // Dhaka default

  useEffect(() => {
    // Listen for donors
    const donorQuery = query(
      collection(db, "users"),
      where("isDonor", "==", true),
      where("isAvailable", "==", true)
    );
    const unsubDonors = onSnapshot(donorQuery, (snap) => {
      const data = snap.docs.map(doc => doc.data() as UserProfile);
      setDonors(data);
    });

    // Listen for requests
    const requestQuery = query(
      collection(db, "emergency_requests"),
      where("status", "==", "Active")
    );
    const unsubRequests = onSnapshot(requestQuery, (snap) => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as EmergencyRequest)
        .filter(req => new Date(req.createdAt).getTime() >= twentyFourHoursAgo);
      setRequests(data);
    });

    return () => {
      unsubDonors();
      unsubRequests();
    };
  }, []);

  const filteredDonors = filter === "All" ? donors : donors.filter(d => d.bloodGroup === filter);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
        <button 
          onClick={() => setFilter("All")}
          className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold border shadow-sm transition-all ${filter === "All" ? "bg-primary border-primary text-white" : "bg-white border-border text-text-main hover:bg-bg-slate"}`}
        >
          All Groups
        </button>
        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
          <button 
            key={bg}
            onClick={() => setFilter(bg)}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold border shadow-sm transition-all ${filter === bg ? "bg-primary border-primary text-white" : "bg-white border-border text-text-main hover:bg-bg-slate"}`}
          >
            {bg}
          </button>
        ))}
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-border shadow-md relative z-10">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={center} />

          {/* Donors */}
          {filteredDonors.map((donor) => (
            donor.location && (
              <Marker 
                key={donor.userId} 
                position={[donor.location.latitude, donor.location.longitude]}
                icon={DonorIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-3 space-y-2 min-w-[200px] bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-text-main">{donor.name}</span>
                      <span className="bg-donor text-white px-2 py-0.5 rounded-lg text-xs font-black">{donor.bloodGroup}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${donor.phoneNumber}`} className="text-primary font-bold">{donor.phoneNumber}</a>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className={`h-2 w-2 rounded-full ${donor.isAvailable ? "bg-donor animate-pulse" : "bg-text-muted"}`}></div>
                      <span className="text-[10px] uppercase font-black tracking-tighter text-text-muted">
                        {donor.isAvailable ? "Ready to Donate" : "Offline"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Requests */}
          {requests.map((req) => (
            <Marker 
              key={req.id} 
              position={[req.location.latitude, req.location.longitude]}
              icon={RequestIcon}
            >
              <Popup className="custom-popup">
                <div className="p-4 space-y-3 min-w-[220px] bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emergency animate-ping"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emergency">Critical Need</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                      <Clock className="h-3 w-3" />
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="bg-emergency text-white px-3 py-1 rounded-xl font-black text-xl shadow-sm shadow-emergency/20">{req.bloodGroup}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${req.urgency === 'Critical' ? 'bg-text-main text-white' : 'bg-bg-slate border border-border text-text-main'}`}>
                      {req.urgency}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-text-muted" />
                      <a href={`tel:${req.contactNumber}`} className="text-primary font-black text-sm">{req.contactNumber}</a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2 rounded-lg border border-gray-100 dark:border-slate-800 text-[10px] space-y-1 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available Donors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Emergency Requests</span>
          </div>
        </div>
      </div>
    </div>
  );
}
