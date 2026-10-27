import { syncDrillsToFirestore } from './src/firebase';
import { ALL_DRILLS } from './src/data';

async function run() {
  console.log("Starting forced sync...");
  await syncDrillsToFirestore(ALL_DRILLS);
  console.log("Forced sync complete.");
}

run();
