const { sanitizeRecord } = require('./sanitization.js')
const { getFirestore } = require('firebase-admin/firestore')
const db = getFirestore()
module.exports = {
  async parseDelta (delta, event, tableId) {
    let change
    if (event === 'write' || event === 'update') {
      change = {
        before: delta.before.data() || {},
        after: delta.after.data() || {}
      }
    } else if (event === 'create') {
      change = {
        before: {},
        after: delta.data() || {}
      }
    } else if (event === 'delete') {
      change = {
        before: delta.data() || {},
        after: {}
      }
    }
    const model = await db.collection('database').doc(tableId).get().then((s) => s.get('model'))
    const fullModel = {
      $id: {
        type: 'string'
      },
      $createdAt: {
        type: 'date'
      },
      $updatedAt: {
        type: 'date'
      },
      ...model
    }
    return {
      before: sanitizeRecord(change.before, fullModel),
      after: sanitizeRecord(change.after, fullModel)
    }
  },
  database () {
    return {
      table (tableId) {
        return {
          record (recordId) {
            return {
              async get () {
                const model = await db.collection('database').doc(tableId).get().then((s) => s.get('model'))
                const record = await db.collection('database').doc(tableId).collection('records').doc(recordId).get().then((s) => s.data() || {})
                return sanitizeRecord(record, model)
              },
              async update (data) {
                const model = await db.collection('database').doc(tableId).get().then((s) => s.get('model'))
                const record = await db.collection('database').doc(tableId).collection('records').doc(recordId).get().then((s) => s.data() || {})
                const updatedRecord = sanitizeRecord({ ...record, ...data }, model)
                await db.collection('database').doc(tableId).collection('records').doc(recordId).set(updatedRecord, { merge: true })
              },
              async delete () {
                await db.collection('database').doc(tableId).collection('records').doc(recordId).delete()
              }
            }
          },
          async get () {
            const model = await db.collection('database').doc(tableId).get().then((s) => s.get('model'))
            const records = await db.collection('database').doc(tableId).collection('records').get().then((s) => s.docs.map((d) => sanitizeRecord(d.data() || {}, model)))
            return records
          }
        }
      }
    }
  }
}