const { getFirestore } = require('firebase-admin/firestore')
const db = getFirestore()
const tables = require('./setupData.json')
module.exports = async (req, res) => {
  // Iterate through each table
  for (const [tableId, table] of Object.entries(tables)) {
    await db.collection('database').doc(tableId).set({ model: table.model }) 
  }
  await db.collection('settings').doc('default').set({
    setupDone: true
  })
  res.send('Setup complete!')
}