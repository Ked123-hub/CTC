import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db/index.js";
import { workersTable } from "./models/index.js";

const SALT_ROUNDS = 10;

function randomPhone(i) {
  // produce a deterministic but unique indian-like phone number
  const base = 9800000000 + i;
  return `+91${base}`;
}

function makeWorker(i, stamp, passwordHash) {
  const idx = i + 1;
  return {
    firstname: `Worker${idx}`,
    lastname: `Sample${idx}`,
    email: `worker${stamp}${idx}@example.com`,
    phone: randomPhone(idx),
    passwordHash,
    role: "WORKER",
    department: "Field",
    status: "ACTIVE",
    skills: JSON.stringify(["General"]),
  };
}

async function insertWorkers(count = 100) {
  console.log(`👷‍♀️  Generating ${count} sample workers...`);
  const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);
  const stamp = Date.now();

  const workers = [];
  for (let i = 0; i < count; i++) {
    workers.push(makeWorker(i, stamp, passwordHash));
  }

  try {
    const inserted = await db.insert(workersTable).values(workers).returning();
    console.log(`   ✓ Inserted ${inserted.length} workers`);
  } catch (err) {
    console.error("❌ Error inserting workers:", err);
    process.exitCode = 2;
  }
}

insertWorkers(100)
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
