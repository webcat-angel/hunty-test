import { map, mapValues, toNumber, isArray, isObject } from 'lodash-es'
export function sanitizeRecord (record, model) {
  return mapValues(model, (field, fieldId) => sanitizeField(record[fieldId], field))
}
export function sanitizeField (data, field) {
  const DEFAULT_SANITIZER = () => `${data || ''}`
  const SANITIZERS = {
    string: () => `${data || ''}`,
    rich: () => `${data || ''}`,
    number: () => toNumber(data || 0),
    currency: () => toNumber(data || 0),
    date: () => new Date(data || 0).valueOf(),
    boolean: () => !!data,
    image: () => `${data || ''}`,
    embed: () => `${data || ''}`,
    url: () => `${data || ''}`,
    email: () => `${data || ''}`,
    phone: () => `${data || ''}`,
    file: () => `${data || ''}`,
    address: () => ({
      address1: data?.address1 || '',
      address2: data?.address2 || '',
      city: data?.city || '',
      state: data?.state || '',
      country: data?.country || '',
      zip: data?.zip || ''
    }),
    reference: () => `${isObject(data) ? data.tableId : (data || '')}`,
    references: () => isArray(data) ? map(data, i => isObject(i) ? i.tableId : (i || '')) : (data ? [data] : []),
    computed: () => null,
    csv: () => `${data || ''}`
  }
  if (field?.multiple) return isArray(data) ? map(data, i => sanitizeField(i, { ...field, multiple: false })) : []
  return (SANITIZERS[field?.type] || DEFAULT_SANITIZER)()
}
