const DB_NAME = "VideoPlatformDB";
const STORE_NAME = "videos";
const DB_VERSION = 1;

export const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(`IndexedDB error: ${event.target.errorCode}`);
    };
  });
};

export const saveVideoToDB = async (videoId: string, blob: Blob) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, videoId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save video");
  });
};

export const getVideoFromDB = async (videoId: string): Promise<Blob | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(videoId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Failed to retrieve video");
  });
};

export const deleteVideoFromDB = async (videoId: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(videoId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to delete video");
  });
};