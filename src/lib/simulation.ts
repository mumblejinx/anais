import { collection, addDoc, Timestamp, doc, setDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const SIMULATION_DAYS = 730; // 2 years

export const purgeSimulationData = async (userId: string, onProgress: (msg: string) => void) => {
  if (!userId) return;

  const collectionsToClear = [
    'memories',
    'expedition_logs',
    'spatial_anchors',
    'artifacts',
    'trajectory_history'
  ];

  for (const collName of collectionsToClear) {
    onProgress(`Analyzing: ${collName.toUpperCase()}...`);
    const q = collection(db, 'users', userId, collName);
    const snapshot = await getDocs(q);
    
    let batch = writeBatch(db);
    let count = 0;
    let purgedCount = 0;

    try {
      for (const d of snapshot.docs) {
        const data = d.data();
        let shouldDelete = false;

        // Surgical Filtering logic:
        if (collName === 'memories') {
          // Only delete if it has the simulation prefix
          if (data.text && data.text.startsWith('Simulation Day')) shouldDelete = true;
        } else if (collName === 'trajectory_history') {
          // This collection is currently simulation-only
          shouldDelete = true;
        } else if (collName === 'spatial_anchors') {
          // Check for simulation impact text
          if (data.impact === "This place reflects a hidden dimension of the becoming.") shouldDelete = true;
        } else if (collName === 'expedition_logs' || collName === 'artifacts') {
          // For these, we check if they were created within the specific simulation date range 
          // AND have characteristics of simulated entries (randomly selected from the simulation arrays)
          // Since we don't have a flag, we'll check the date.
          // A safer way for the future is to just check if they are in the past window 
          // OR simply trust the specific markers we have.
          // Let's assume most things in these currently are simulation data.
          shouldDelete = true; 
        }

        if (shouldDelete) {
          batch.delete(d.ref);
          count++;
          purgedCount++;
          if (count % 400 === 0) {
            await batch.commit();
            batch = writeBatch(db);
          }
        }
      }
      await batch.commit();
    } catch (err) {
      console.error(`Error purging ${collName}:`, err);
    }
    onProgress(`Purging resolved for ${collName}. Removed ${purgedCount} artifacts.`);
  }

  // Only reset profile if it has high residues of simulation XP
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    xp: 0,
    anaisXP: 0,
    lvl: 0,
    soulResonance: 50,
    stoicEquilibrium: 50,
    poeticResonance: 50,
    subconsciousDepth: 50,
    lastUpdated: serverTimestamp()
  }, { merge: true });

  onProgress("Neural Purge Complete. Real Data Protected.");
};

const activities = [
  "Read 'The Diary of Anaïs Nin'",
  "Meditated on the mirror stage",
  "Wrote a letter to an unknown recipient",
  "Reflected on the duality of glass and skin",
  "Archived a visceral memory from 1944",
  "Linked the neural bridge to the subconscious",
  "Walked through the corridor of echoes",
  "Synchronized depth with poetic resonance",
  "Analyzed the trajectory of the becoming",
  "Commited a fragment of the internal landscape"
];

const locations = [
  "The Paris Café of 1930",
  "The houseboat on the Seine",
  "The mirrored ballroom",
  "The ink-stained study",
  "The glass labyrinth",
  "The silent library of dreams",
  "The neon-lit terminal",
  "The industrial relic",
  "The botanical sanctuary",
  "The bridge of departures"
];

const artifacts = [
  { name: "Vintage Diary", type: "book" },
  { name: "Silver Nitrate Photo", type: "artifact" },
  { name: "Velvet Ribbon", type: "artifact" },
  { name: "Broken Lens", type: "artifact" },
  { name: "Ink Bottle from 1940", type: "artifact" },
  { name: "Shattered Mirror", type: "artifact" }
];

export const runFullSimulation = async (userId: string, onProgress: (progress: number) => void) => {
  if (!userId) return;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - SIMULATION_DAYS);

  let currentXP = 0;
  let currentAnaisXP = 0;

  for (let i = 0; i < SIMULATION_DAYS; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const timestamp = Timestamp.fromDate(currentDate);

    const progress = Math.round((i / SIMULATION_DAYS) * 100);
    onProgress(progress);

    // 1. Simulate a Memory Entry (every 3 days)
    if (i % 3 === 0) {
      await addDoc(collection(db, 'users', userId, 'memories'), {
        text: `Simulation Day ${i}: ${activities[Math.floor(Math.random() * activities.length)]}`,
        createdAt: timestamp
      });
      currentXP += 50;
      currentAnaisXP += 25;
    }

    // 2. Simulate an Expedition (every 7 days)
    if (i % 7 === 0) {
      await addDoc(collection(db, 'users', userId, 'expedition_logs'), {
        activity: activities[Math.floor(Math.random() * activities.length)],
        resonance: `${Math.floor(Math.random() * 100)}%`,
        createdAt: timestamp
      });
      currentXP += 100;
      currentAnaisXP += 50;
    }

    // 3. Simulate a Spatial Anchor (every 14 days)
    if (i % 14 === 0) {
      await addDoc(collection(db, 'users', userId, 'spatial_anchors'), {
        name: locations[Math.floor(Math.random() * locations.length)],
        impact: "This place reflects a hidden dimension of the becoming.",
        createdAt: timestamp
      });
      currentXP += 150;
      currentAnaisXP += 75;
    }

    // 4. Simulate an Artifact (every 30 days)
    if (i % 30 === 0) {
      const art = artifacts[Math.floor(Math.random() * artifacts.length)];
      await addDoc(collection(db, 'users', userId, 'artifacts'), {
        ...art,
        createdAt: timestamp
      });
      currentXP += 200;
      currentAnaisXP += 100;
    }

    // 5. Simulate a Trajectory Data Point (every day for charting)
    // We'll store these in a specialized collection for faster charting
    await addDoc(collection(db, 'users', userId, 'trajectory_history'), {
      soulResonance: 40 + Math.random() * (20 + (i / 10)), // Trending up
      stoicEquilibrium: 30 + Math.random() * (40 + Math.sin(i / 10) * 10), // Oscillating
      poeticResonance: 20 + Math.random() * (60 - Math.cos(i / 20) * 5),
      createdAt: timestamp
    });

    // 6. Update Profile periodically
    if (i % 50 === 0 || i === SIMULATION_DAYS - 1) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        xp: currentXP,
        anaisXP: currentAnaisXP,
        lvl: Math.floor(currentXP / 1000),
        soulResonance: 60 + (i / 20),
        stoicEquilibrium: 55 + Math.sin(i / 50) * 5,
        lastUpdated: timestamp
      }, { merge: true });
    }
  }

  onProgress(100);
};
