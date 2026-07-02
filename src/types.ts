export interface Ad {
  id?: string; // ID gerado pelo Firestore ou gerado localmente no modo demo
  title: string;
  imageUrl: string;
  videoUrl: string;
  isVideo: boolean;
  durationMillis: number;
  createdAt?: any; // Timestamp do Firestore ou número epoch
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
