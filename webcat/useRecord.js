import { reactive, computed, watch } from 'vue'
import { subscribeToDoc, getDoc, getId } from './firebase'
import { sanitizeField } from './sanitization'
import { each, mapValues, isString, map, includes, get, compact, size } from 'lodash-es'
import useAuth from './useAuth'
export default function useRecord ({ tableId, recordId, expand }) {
  const record$ = subscribeToDoc()
  const table$ = subscribeToDoc()
  const user = useAuth()
  table$.subscribe(`database/${tableId}`)
  let api = reactive({
    $id: recordId || '',
    $loading: true,
    $error: '',
    $model: computed(() => table$.data?.model || {}),
    $fullModel: computed(() => ({
      ...table$.data?.model || {},
      $id: { type: 'string' },
      $createdAt: { type: 'date' },
      $updatedAt: { type: 'date' },
      $createdBy: { type: 'reference', tableId: 'wc-users' },
      $updatedBy: { type: 'reference', tableId: 'wc-users' }
    })),
    $save: wrapFn(() => updateRef()),
    $remove: wrapFn(() => getDoc(`database/${tableId}/records/${recordId}`).delete()),
    $clear: () => {
      api.$id = ''
      delete api.$createdAt
      delete api.$updatedAt
      const clearData = sanitizeRecord({}, api.$model)
      each(api.$model, ({}, field) => {
        api[field] = clearData[field]
      })
    },
  })
  watch(() => api.$id, (id) => {
    api.$loading = true
    if (id) record$.subscribe(`database/${tableId}/records/${id}`)
    else record$.unsubscribe()
  }, { immediate: true })
  watch(() => record$.data, (newVal) => {
    api.$loading = false
    api.$error = ''
    if (!newVal) return
    for (const [key, field] of Object.entries(api.$fullModel)) {
      if (key === '$id') continue
      if (includes(expand, key)) {
        // Expand data
        const tableId = field.tableId
        const isExpandable = size(newVal[key]) && tableId
        if (field.type === 'reference') api[key] = isExpandable ? useRecord({ tableId, recordId: newVal[key], expand: getNextExpandStep(expand) }) : {}
        if (field.type === 'references') api[key] = isExpandable ? useRecords({ tableId, records: newVal[key], expand: getNextExpandStep(expand) }) : []
      } else {
        api[key] = sanitizeField(newVal[key], field)
      }
    }
  })
  return api
  async function updateRef () {
    const newId = getId()
    if (!api.$id) {
      api.$id = newId
    }
    const ref = getDoc(`database/${tableId}/records/${api.$id}`)
    let newData = mapValues(api.$fullModel, (field, k) => {
      // Consider expanded fields
      if (field.type === 'reference') return isString(api[k]) ? api[k] : get(api[k], '$id') || ''
      if (field.type === 'references') return map(api[k], i => isString(i) ? i : i.$id)
      // Sanitize rest of fields
      return sanitizeField(api[k], field)
    })
    newData.$createdAt = api.$createdAt || Date.now()
    newData.$createdBy = api.$createdBy || user.$id
    newData.$updatedAt = Date.now()
    newData.$updatedBy = user.$id
    await ref.set(newData, { merge: true })
  }
  function wrapFn (fn) {
    return (...args) => {
      api.$loading = true
      return fn(...args).then(() => {
        api.$loading = false
      }).catch(err => {
        console.log('err', err)
        api.$loading = false
        api.$error = err.toString()
        throw new Error(err)
      })
    }
  }
}
function useRecords ({ tableId, records: recordIds }) {
  const records = map(compact(recordIds), recordId => useRecord({ tableId, recordId }))
  return records
}
function getNextExpandStep (expand) {
  return compact(map(expand, i => i.split('.').slice(1).join('.')))
}