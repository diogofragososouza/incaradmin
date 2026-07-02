import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { FirebaseConfig } from "../types";

export function initializeFirebase(config: FirebaseConfig): { app: FirebaseApp; db: Firestore; auth: Auth } {
  const apps = getApps();
  for (const app of apps) {
    // Evita conflitos limpando instâncias anteriores se houver reconfiguração
    if (app.name === "[DEFAULT]") {
      // Opcional: pode manter ou deletar dependendo de sua necessidade de hot-reload
    }
  }
  
  const app = initializeApp(config);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  return { app, db, auth };
}