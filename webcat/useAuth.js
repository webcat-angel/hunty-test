
import useApp from './useApp'
import { signIn, signUp, signOut, subscribeToAuth } from './firebase'
import { watchEffect, reactive, computed, ref as vueRef } from 'vue'
// import { reactive, computed, ref as vueRef } from 'vue'
// import { sanitizeRecord, sanitizeField } from '../../helpers/sanitization'
// import { difference, each, mapValues, isString, get, map } from 'lodash-es'
// import getMethods from './methods'
let auth
export default () => {
  if (!auth) {
    auth = subscribeToAuth()
    auth.subscribe()
  }
  const app = useApp()
  let userIdRef = vueRef('')
  const api = reactive({
    // IDs
    $id: computed(() => userIdRef.value),
    id: computed(() => userIdRef.value),
    uid: computed(() => userIdRef.value),
    // Sign In / Sign Up
    email: '',
    password: '',
    newPassword: '',
    // Params
    $loading: false,
    $error: '',
    $e: {},
    // API
    $logout: wrapFn(() => signOut()),
    $login: wrapFn(() => signIn(api.email, api.password)),
    $register: wrapFn(() => signUp(api.email, api.password))
  })
  watchEffect(() => {
    userIdRef.value = auth.data?.uid
  })
  return api
  function wrapFn (fn) {
    return (...args) => {
      api.$loading = true
      return fn(...args).then(result => {
        api.$loading = false
        api.$error = ''
        api.$e = {}
        return result
      }).catch(err => {
        api.$loading = false
        const [errorCode, errorMessage] = {
          'auth/wrong-password': [
            'wrongPassword',
            'Incorrect password'
          ],
          'auth/user-not-found': [
            'userNotFound',
            'User not found'
          ],
          'auth/invalid-password': [
            'invalidPassword',
            'Invalid password'
          ],
          'auth/invalid-email': [
            'invalidEmail',
            'Invalid email'
          ],
          'auth/email-already-in-use': [
            'emailAlreadyInUse',
            'Email already in use'
          ]
        }[err.message] || [err.message, err.message]
        api.$error = errorMessage
        api.$e = { [errorCode]: true }
      })
    }
  }
}

// export default function getReactiveAuth ({ project, onDestroy = () => {} }, scope, firebase) {
//   const projectId = project?.id
//   const model = project.database?.tables?.['wc-users']?.model
//   const methods = getMethods(projectId, firebase)
//   let data = sanitizeRecord({}, model)
//   let $id = firebase.auth().currentUser?.uid || ''
//   const tableId = 'wc-users'
//   let userIdRef = vueRef($id)
//   let api = reactive({
    
//     // Data
//     $raw: {},
//     ...data,
//     // Sign In / Sign Up
//     email: '',
//     password: '',
//     newPassword: '',
//     // Params
//     $loading: false,
//     $error: '',
//     $e: {},
//     $model: model,
//     // API
//     $logout: wrapFn(() => signOut()),
//     $login: wrapFn(() => signIn()),
//     $register: wrapFn(({ preventLogin } = {}) => signUp({ preventLogin })),
//     $save: wrapFn(() => updateRef()),
//     $addToSubcollection: wrapFn((obj, submodelId, field) => updateRecord({
//       [field]: [...((data.$raw || {})[field] || []), submodelId]
//     })),
//     $removeFromSubcollection: wrapFn((obj, submodelId, field) => updateRecord({
//       [field]: difference((data.$raw || {})[field] || [], [submodelId])
//     }))
//   })
//   let unsubscribe
//   let unsubscribeAuth
//   let unsubscribes
//   onDestroy(() => [
//     unsubscribe && unsubscribe(),
//     unsubscribeAuth && unsubscribeAuth(),
//     unsubscribes && each(unsubscribes, fn => fn())
//   ])
//   unsubscribeAuth = firebase.auth().onAuthStateChanged(user => {
//     const recordId = user?.uid || ''
//     userIdRef.value = recordId
//     if (unsubscribe) unsubscribe()
//     if (recordId) {
//       api.$loading = true
//       const doc = getDocRef({ projectId, tableId, recordId }, firebase)
//       unsubscribe = doc.onSnapshot(s => {
//         api.$loading = false
//         let newVal = sanitizeRecord(s.data() || {}, model)
//         each(model, ({}, field) => {
//           api[field] = newVal[field]
//         })
//       })
//     } else {
//       unsubscribe = undefined
//     }
//   })
//   return api
//   async function signIn () {
//     const { email, password } = api
//     return methods.login(email, password)
//   }
//   async function signUp ({ preventLogin }) {
//     const { email, password } = api
//     let data = sanitizeRecord(api, model)
//     return methods.register({ email, password, data }, preventLogin)
//   }
//   async function signOut () {
//     let newVal = sanitizeRecord({}, model)
//     each(model, (fieldConfig, field) => {
//       api[field] = newVal[field]
//     })
//     return methods.logout()
//   }
//   async function updateRef () {
//     await updateRecord(mapValues(model, (field, k) => {
//       // Consider expanded fields
//       if (field.type === 'reference') return isString(api[k]) ? api[k] : get(api[k], '$id') || ''
//       if (field.type === 'references') return map(api[k], i => isString(i) ? i : i.$id)
//       // Sanitize rest of fields
//       return sanitizeField(api[k], field)
//     }))
//   }
//   async function updateRecord (data) {
//     await getDocRef({ projectId, tableId, recordId: api.$id }, firebase).set(data, { merge: true })
//   }
// }
// function getDocRef ({ projectId, tableId, recordId }, firebase) {
//   return getCollectionRef({ projectId, tableId }, firebase).doc(recordId)
// }
// function getCollectionRef ({ projectId, tableId }, firebase) {
//   return firebase.firestore().collection('projects').doc(projectId).collection('database').doc(tableId).collection('records')
// }
