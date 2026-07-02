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

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}