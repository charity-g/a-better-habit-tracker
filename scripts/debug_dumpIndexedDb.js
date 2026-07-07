// do this in browser window
async function dumpIndexedDB() {
  const dbs = await indexedDB.databases();

  for (const { name } of dbs) {
    if (!name) continue;

    const req = indexedDB.open(name);
    const db = await new Promise((resolve, reject) => {
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });

    console.log(`DB: ${name}`);
    console.log("stores:", Array.from(db.objectStoreNames));

    for (const storeName of db.objectStoreNames) {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);

      const [keys, values] = await Promise.all([
        store.getAllKeys(),
        store.getAll(),
      ]);

      console.log(`  Store: ${storeName}`);
      console.log(Object.fromEntries(keys.map((key, i) => [key, values[i]])));
    }

    db.close();
  }
}

dumpIndexedDB();