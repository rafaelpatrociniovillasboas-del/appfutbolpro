import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clearDB() {
  console.log("Clearing DB...");
  const snap = await getDocs(collection(db, "drills"));
  console.log(`Found ${snap.docs.length} docs to delete.`);
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
  console.log("Done.");
}

clearDB();
