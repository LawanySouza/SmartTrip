/**
 * Firebase App — inicialização singleton com guard anti-duplicata.
 * Padrão: getApps().length === 0 previne exceção em HMR do Vite.
 * SPEC: SPEC_FIREBASE.md §4.2
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Guard em desenvolvimento: avisa variáveis ausentes sem lançar exceção (ignora em modo test)
if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ] as const;
  required.forEach((key) => {
    if (!import.meta.env[key]) {
      // Aviso deliberado sobre config ausente — não expõe dados sensíveis
      console.warn(`[SmartTrip] Variável de ambiente ausente: ${key}. Configure .env.local.`);
    }
  });
}

// Anti-duplicata: reutiliza app existente (safe em HMR e SSR)
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;
