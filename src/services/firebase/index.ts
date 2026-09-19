/**
 * Barrel: re-exporta os módulos Firebase para importação única.
 * Uso: import { auth, signInWithEmail, db } from '../services/firebase';
 */
export { default as app } from './config';
export { auth, signUpWithEmail, signInWithEmail, signOutUser, sendPasswordReset, onAuthChange, getCurrentFirebaseUser } from './auth';
export {
  db,
  usersCol,
  userDoc,
  preferencesDoc,
  availabilityCol,
  availabilityDoc,
  tripsCol,
  tripDoc,
  itineraryItemsCol,
  itineraryItemDoc,
} from './firestore';
export { mapAuthError, AUTH_ERRORS } from './errors';
