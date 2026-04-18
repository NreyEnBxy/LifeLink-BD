export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  bloodGroup: BloodGroup;
  phoneNumber: string;
  isDonor: boolean;
  isAvailable: boolean;
  lastDonationDate?: string;
  location?: GeoLocation;
  updatedAt: string;
}

export interface EmergencyRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  bloodGroup: BloodGroup;
  location: GeoLocation;
  contactNumber: string;
  urgency: "Low" | "Normal" | "Critical";
  status: "Active" | "Fulfilled" | "Cancelled";
  createdAt: string;
}
