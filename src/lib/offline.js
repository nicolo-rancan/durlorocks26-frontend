import { openDB } from 'idb';

const DB_NAME = 'durlo-rocks';
const DB_VERSION = 1;

let db;

async function getDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('prevendite')) {
          const store = database.createObjectStore('prevendite', { keyPath: 'id' });
          store.createIndex('codice', 'codice');
          store.createIndex('edizione', 'edizione');
        }
        if (!database.objectStoreNames.contains('meta')) {
          database.createObjectStore('meta');
        }
      },
    });
  }
  return db;
}

export async function cachePrevendite(edizione, items) {
  const database = await getDB();
  const tx = database.transaction(['prevendite', 'meta'], 'readwrite');
  await Promise.all(items.map((item) => tx.objectStore('prevendite').put(item)));
  await tx.objectStore('meta').put(Date.now(), `lastSync_${edizione}`);
  await tx.done;
}

export async function getCachedPrevendite(edizione, search) {
  const database = await getDB();
  const all = await database.getAllFromIndex('prevendite', 'edizione', edizione);
  if (!search?.trim()) return all;
  const q = search.toLowerCase();
  return all.filter(
    (p) =>
      p.nome.toLowerCase().includes(q) ||
      p.cognome.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.codice.includes(q)
  );
}

export async function getLastSyncTime(edizione) {
  const database = await getDB();
  return database.get('meta', `lastSync_${edizione}`);
}
