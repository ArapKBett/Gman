// Firebase Admin SDK Backup Script
// Run with: node scripts/backup.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// Download your service account key from Firebase Console
// Place it in the project root as 'serviceAccountKey.json'
try {
  const serviceAccount = require('../serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error: Could not find serviceAccountKey.json');
  console.error('Download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

async function backupCollection(collectionName) {
  console.log(`Backing up ${collectionName}...`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];
    
    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✓ ${collectionName}: ${data.length} documents backed up`);
    return data;
  } catch (error) {
    console.error(`✗ Error backing up ${collectionName}:`, error.message);
    return [];
  }
}

async function performBackup() {
  console.log('\n========================================');
  console.log('Goldman Hardware Database Backup');
  console.log('========================================\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupData = {
    timestamp: new Date().toISOString(),
    collections: {}
  };
  
  // Collections to backup
  const collections = ['products', 'offers', 'orders'];
  
  for (const collectionName of collections) {
    backupData.collections[collectionName] = await backupCollection(collectionName);
  }
  
  // Save to file
  const fileName = `backup-${timestamp}.json`;
  const filePath = path.join(__dirname, '..', fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
  
  console.log('\n========================================');
  console.log(`✓ Backup completed successfully!`);
  console.log(`✓ File saved: ${fileName}`);
  console.log('========================================\n');
  
  // Calculate total documents
  const totalDocs = Object.values(backupData.collections)
    .reduce((sum, collection) => sum + collection.length, 0);
  
  console.log(`Total documents backed up: ${totalDocs}`);
  console.log('\nBackup Summary:');
  Object.entries(backupData.collections).forEach(([name, data]) => {
    console.log(`  - ${name}: ${data.length} documents`);
  });
  
  process.exit(0);
}

// Run backup
performBackup().catch(error => {
  console.error('\n✗ Backup failed:', error);
  process.exit(1);
});