const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://note-bridge-app.firebasestorage.app",
});

const bucket = admin.storage().bucket();

async function deleteFolderRecursive(folderPath) {
  try {
    const [files] = await bucket.getFiles({ prefix: folderPath });

    const deletePromises = files.map((file) => {
      file.delete();
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    return { error: true, message: error.message };
  }
}

module.exports = deleteFolderRecursive;
