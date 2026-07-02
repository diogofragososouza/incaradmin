import { initializeApp, getApps, deleteApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { FirebaseConfig } from "../types";

export function initializeFirebase(config: FirebaseConfig): { app: FirebaseApp; db: Firestore; auth: Auth } {
  // Se já existem aplicativos inicializados, vamos limpá-los para evitar conflitos de múltiplas inicializações
  const apps = getApps();
  for (const app of apps) {
    try {
      deleteApp(app);
    } catch (e) {
      console.warn("Erro ao deletar app anterior:", e);
    }
  }

  // Inicializar o novo app
  const app = initializeApp(config);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  return { app, db, auth };
}
