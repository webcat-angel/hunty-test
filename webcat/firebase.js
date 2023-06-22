import { reactive, ref as localRef, computed } from '@vue/composition-api'
import { size, reduce, zipObject, mapValues, each, fromPairs, map, isObject } from 'lodash-es'
let fb
const getFirebase = () => fb
const ssrRef = localRef
export function setupFirebase (firebase) {
  fb = firebase
}
export function getId () {
  const firebase = getFirebase()
  return firebase.database().ref().push().key
}
export function getRef (path) {
  const firebase = getFirebase()
  return firebase.database().ref(path)
}
export function getDoc (path) {
  const firebase = getFirebase()
  return reduce(path.split('/'), (base, part, index) => {
    let isDoc = index % 2
    base = base[isDoc ? 'doc' : 'collection'](part)
    return base
  }, firebase.firestore())
}
export function getUser () {
  const firebase = getFirebase()
  return firebase.auth().currentUser
}
export function subscribeToRef (name) {
  let ref = null
  let resolveFn = {
    fn: null
  }
  const refs = {}
  let pathRefId = name + 'id'
  let pathValId = name + 'path'
  let data = (name ? ssrRef : localRef)(refs[name], name)
  let pathId = (name ? ssrRef : localRef)(refs[pathRefId], pathRefId)
  let pathVal = (name ? ssrRef : localRef)(refs[pathValId], pathValId)
  if (!process.server) {
  } else {
  }
  let api = reactive({
    id: computed(() => pathId.value),
    data: computed(() => data.value),
    path: computed(() => pathVal.value),
    subscribe (path) {
      if (path !== api.path || !api.path) api.unsubscribe()
      pathVal.value = path
      if (ref) ref.off('value', onValue)
      ref = getRef(path)
      ref.on('value', onValue)
      return new Promise((resolve, reject) => {
        try {
          resolveFn.fn = resolve
        } catch (e) {
          reject(e)
        }
      })
    },
    unsubscribe () {
      if (ref) ref.off('value', onValue)
      ref = null
      data.value = null
      pathVal.value = ''
      pathId.value = ''
    }
  })
  return api
  function onValue (snapshot) {
    const newVal = isObject(snapshot.val()) ? {
      id: snapshot.key,
      ...snapshot.val()
    } : snapshot.val()
    data.value = newVal
    pathId.value = snapshot.key
    setTimeout(() => {
      if (resolveFn.fn) {
        resolveFn.fn(snapshot.val())
      }
    })
  }
}
export function subscribeToRefs () {
  let refs = {}
  let fns = {}
  const api = reactive({
    data: {},
    subscribe (paths) {
      const pathObj = zipObject(paths, paths)
      refs = mapValues(pathObj, path => getRef(path))
      fns = mapValues(paths, (path, id) => s => {
        api.data[id] = s.val()
      })
      each(refs, (ref, id) => ref.on('value', fns[id]))
    },
    unsubscribe () {
      each(refs, (ref, id) => ref.off('value', fns[id]))
      refs = {}
      fns = {}
    }
  })
  return api
}
export function subscribeToCollection (name) {
  let unsubscribe = null
  let data = (name ? ssrRef : localRef)({}, name)
  let pathVal = (name ? ssrRef : localRef)({}, name + 'path')
  let api = reactive({
    data: computed(() => data.value),
    path: computed(() => pathVal.value),
    loading: false,
    resolve: () => {},
    subscribe (path, where, onError) {
      if (path !== api.path) api.unsubscribe()
      pathVal.value = path
      api.loading = true
      let ref = getDoc(path)
      if ((path.split('/').length % 2) && size(where)) {
        ref = ref.where(...where)
      }
      unsubscribe = ref.onSnapshot(s => {
        const parsedDocs = fromPairs(map(s.docs, doc => [doc.id, doc.data()]))
        data.value = parsedDocs
        api.loading = false
        if (api.resolve) api.resolve(parsedDocs)
        if (process.server) {
          unsubscribe()
        }
      }, onError)
      return new Promise(resolve => {
        api.resolve = resolve
      })
    },
    unsubscribe () {
      api.loading = false
      if (unsubscribe) unsubscribe()
      data.value = {}
      pathVal.value = ''
      unsubscribe = null
    }
  })
  return api
}
export function subscribeToDoc (name) {
  let unsubscribe = null
  let data = (name ? ssrRef : localRef)({}, name)
  let pathVal = (name ? ssrRef : localRef)({}, name + 'path')
  let api = reactive({
    data: computed(() => data.value),
    path: computed(() => pathVal.value),
    loading: false,
    resolved: () => {},
    subscribe (path, onError) {
      if (path !== api.path) api.unsubscribe()
      pathVal.value = path
      api.loading = true
      let ref = getDoc(path)
      unsubscribe = ref.onSnapshot(doc => {
        data.value = doc.data()
        api.loading = false
        if (api.resolved) api.resolved(api.data)
        if (process.server) unsubscribe()
      }, onError)
      return new Promise((resolve, reject) => {
        try {
          api.resolved = resolve
        } catch (e) {
          reject(e)
        }
      })
    },
    unsubscribe () {
      api.loading = false
      if (unsubscribe) unsubscribe()
      data.value = {}
      pathVal.value = ''
      unsubscribe = null
    }
  })
  return api
}
export function subscribeToAuth () {
  const firebase = getFirebase()
  let authSubscription = reactive({
    data: null
  })
  let unsubscribeAuth
  let api = reactive({
    data: computed(() => authSubscription.data),
    subscribe: () => {
      api.unsubscribe()
      unsubscribeAuth = firebase.auth().onAuthStateChanged(user => {
        authSubscription.data = user
      })
    },
    unsubscribe: () => {
      if (unsubscribeAuth) {
        unsubscribeAuth()
        unsubscribeAuth = undefined
      }
    }
  })
  return api
}
export function signIn (email, password) {
  const firebase = getFirebase()
  return firebase.auth().signInWithEmailAndPassword(email, password)
}
export function signOut () {
  const firebase = getFirebase()
  return firebase.auth().signOut()
}
export function signUp (email, password) {
  const firebase = getFirebase()
  return firebase.auth().createUserWithEmailAndPassword(email, password)
}
export function forgotPassword (email) {
  const firebase = getFirebase()
  return firebase.auth().sendPasswordResetEmail(email)
}
