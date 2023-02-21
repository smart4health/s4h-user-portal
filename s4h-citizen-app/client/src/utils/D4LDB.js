/* eslint-disable no-underscore-dangle */
import { openDB } from 'idb';

// upgrade is only called when the DB_Version is updated.
const DB_VERSION = 2;
const OBJECTSTORE_NAME = 'sessionData';
const INDEXEDDB_NAME = 'd4lDB';

class D4LDB {
  get db() {
    if (this._db) {
      return this._db;
    }

    if (!('indexedDB' in window)) {
      throw new Error("This browser doesn't support IndexedDB");
    }

    // eslint-disable-next-line no-return-assign
    return (this._db = openDB(INDEXEDDB_NAME, DB_VERSION, {
      // creates Objectstore the first time the indexedDB is opened
      upgrade(db) {
        if (!db.objectStoreNames.contains(OBJECTSTORE_NAME)) {
          db.createObjectStore(OBJECTSTORE_NAME);
        }
      },
    }));
  }

  async get(key) {
    return (await this.db).get(OBJECTSTORE_NAME, key);
  }

  async set(key, val) {
    return (await this.db).put(OBJECTSTORE_NAME, val, key);
  }

  async remove(key) {
    return (await this.db).delete(OBJECTSTORE_NAME, key);
  }

  async clear() {
    this._db = null;
    return (await this.db).clear(OBJECTSTORE_NAME);
  }
}

export default new D4LDB();
