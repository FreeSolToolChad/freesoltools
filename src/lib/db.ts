import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface Activity {
  wallet: string;
  signature: string;
  accountsCount: number;
  recoveredSol: number;
  timestamp: number;
}

export interface Stats {
  totalSolRecovered: number;
  accountsClosed: number;
  walletsCleaned: number;
}

export interface DbData {
  stats: Stats;
  activities: Activity[];
}

const DEFAULT_DATA: DbData = {
  stats: {
    totalSolRecovered: 0,
    accountsClosed: 0,
    walletsCleaned: 0
  },
  activities: []
};

export function getDb(): DbData {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
      return DEFAULT_DATA;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("DB Read Error:", error);
    return DEFAULT_DATA;
  }
}

export function saveDb(data: DbData) {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("DB Write Error:", error);
  }
}

export function addActivity(activity: Activity) {
  const db = getDb();
  
  // Update stats
  db.stats.totalSolRecovered += activity.recoveredSol;
  db.stats.accountsClosed += activity.accountsCount;
  db.stats.walletsCleaned += 1;

  // Add activity to top
  db.activities.unshift(activity);
  
  // Keep only last 10
  if (db.activities.length > 10) {
    db.activities = db.activities.slice(0, 10);
  }
  
  saveDb(db);
}
