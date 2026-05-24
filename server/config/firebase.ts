import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the database ID specified in config if exists
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default db;
