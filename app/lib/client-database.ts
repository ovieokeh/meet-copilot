export interface ClientDatabaseReturn {
  getObject: <T>({ store, key }: { store: string; key: string }) => Promise<T>;
  listObjects: <T>({
    store,
    index,
    value,
  }: {
    store: string;
    index: string;
    value: any;
  }) => Promise<T[]>;
  createObject: <T>({
    store,
    object,
  }: {
    store: string;
    object: T;
  }) => Promise<T>;
  putObject: <T>({ store, value }: { store: string; value: T }) => Promise<T>;
  deleteObject: ({
    store,
    key,
  }: {
    store: string;
    key: number;
  }) => Promise<void>;
}

export class ClientDatabase implements ClientDatabaseReturn {
  client: null | IDBDatabase = null;

  constructor() {
    this.client = null;
  }

  initialize = () => {
    return new Promise<[boolean, string]>((resolve, reject) => {
      if (typeof window === "undefined") {
        reject("Window not available");
      }

      const databaseRequest = window.indexedDB.open("meet-copilot", 1);

      databaseRequest.onerror = () => {
        reject("Failed to open database");
      };

      databaseRequest.onsuccess = (event: any) => {
        if (!event.target?.result) {
          return;
        }

        this.client = event.target.result as IDBDatabase;
        resolve([true, "Database opened successfully"]);
      };

      databaseRequest.onupgradeneeded = (event: any) => {
        if (!event.target?.result) {
          return;
        }

        this.client = event.target.result as IDBDatabase;
        this.migrateDefaultData().then(() => {
          console.info("Database migrated successfully");
        });
      };
    });
  };

  isReady = () => {
    return !!this.client;
  };

  migrateDefaultData = () => {
    return new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject("Database not initialized");
      }

      const userObjectStore = this.client!.createObjectStore("users", {
        keyPath: "id",
        autoIncrement: true,
      });
      userObjectStore.createIndex("email", "email", { unique: true });

      const sessionObjectStore = this.client!.createObjectStore("meetings", {
        keyPath: "id",
        autoIncrement: true,
      });
      sessionObjectStore.createIndex("userId", "userId", { unique: false });

      const sessionMessageObjectStore = this.client!.createObjectStore(
        "meeting-messages",
        {
          keyPath: "id",
          autoIncrement: true,
        },
      );
      sessionMessageObjectStore.createIndex("timestamp", "timestamp", {
        unique: false,
      });
      sessionMessageObjectStore.createIndex("meetingId", "meetingId", {
        unique: false,
      });
      sessionMessageObjectStore.createIndex("userId", "userId", {
        unique: false,
      });

      const settingsObjectStore = this.client!.createObjectStore("settings", {
        keyPath: "id",
        autoIncrement: true,
      });
      settingsObjectStore.createIndex("userId", "userId", { unique: true });

      resolve(void 0);
    });
  };

  getObject = <T>({ store, key }: { store: string; key: string }) => {
    return new Promise<T>((resolve, reject) => {
      if (!this.client) {
        reject("Database not initialized");
      }

      const transaction = this.client!.transaction(store, "readonly");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve(request.result as T);
      };
    });
  };

  listObjects = <T>({
    store,
    index,
    value,
  }: {
    store: string;
    index: string;
    value: any;
  }) => {
    return new Promise<T[]>((resolve, reject) => {
      if (!this.client) {
        reject("Database not initialized");
      }

      const transaction = this.client!.transaction(store, "readonly");
      const objectStore = transaction.objectStore(store);
      const storeIndex = objectStore.index(index);
      const request = storeIndex.getAll(value);
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
    });
  };

  createObject = <T>({ store, object }: { store: string; object: any }) => {
    return new Promise<T>((resolve, reject) => {
      if (!this.client) {
        reject("Database not initialized");
      }

      const transaction = this.client!.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.add(object);
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve(request.result as T);
      };
    });
  };

  putObject = <T>({ store, value }: { store: string; value: any }) => {
    return new Promise<T>((resolve, reject) => {
      if (!this.client) {
        reject("Database not initialized");
      }

      let existingObject = {};
      if (!value.id) {
        return reject("Object ID required for update");
      }

      existingObject = this.client!.transaction(store, "readonly")
        .objectStore(store)
        .get(value.id);
      if (!existingObject) {
        return reject("Object not found");
      }

      const transaction = this.client!.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put({
        ...existingObject,
        ...value,
      });
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve(request.result as T);
      };
    });
  };

  deleteObject({ store, key }: { store: string; key: number }) {
    return new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject("Database not initialized");
      }

      const transaction = this.client!.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve(void 0);
      };
    });
  }
}
