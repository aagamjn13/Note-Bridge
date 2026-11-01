const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || "note-bridge-app.firebasestorage.app";

// Read the service account from an env var (JSON or base64 JSON), a mounted
// credentials file, or the local file used during development.
function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(json);
  }

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(keyPath)) {
    return JSON.parse(fs.readFileSync(keyPath, "utf8"));
  }

  return null;
}

function getBucket() {
  if (admin.apps.length === 0) {
    const serviceAccount = readServiceAccount();

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket,
      });
    } else {
      throw new Error(
        "Firebase admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS."
      );
    }
  }

  return admin.storage().bucket();
}

async function deleteFolderRecursive(folderPath) {
  try {
    const bucket = getBucket();
    const [files] = await bucket.getFiles({ prefix: folderPath });

    await Promise.all(files.map((file) => file.delete()));
    return true;
  } catch (error) {
    return { error: true, message: error.message };
  }
}

module.exports = deleteFolderRecursive;
