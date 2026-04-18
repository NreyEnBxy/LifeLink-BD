import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection Verified");
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      // This is expected if the test/connection doc doesn't exist or is protected
      console.log("Firebase initial check: Permission check reached.");
    } else if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your network or Firebase configuration.");
    }
  }
}

testConnection();
