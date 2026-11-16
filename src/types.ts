import type { Timestamp } from "firebase/firestore";

export interface Ad {
  id?: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  isVideo: boolean;
  durationMillis: number;
  description?: string; // Descrição opcional das campanhas
  createdAt?: any;
}

export interface AdScreen {
  id: string;
  deviceId: string;
  isForeground: boolean;
  lastSeenAt: Timestamp | null;
  registeredAt: Timestamp | null;
  appVersion?: string;
  androidVersion?: string;
  deviceModel?: string;
  currentAdId?: string | null;
  location: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    updatedAt: Timestamp | null;
  } | null;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}