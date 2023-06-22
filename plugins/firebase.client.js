import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/database'
import 'firebase/compat/auth'
import 'firebase/compat/functions'
import 'firebase/compat/storage'
const config = {
  apiKey: 'AIzaSyBpE2Y71Sv06GtZFOALlGjHOiYA7OWMaqw',
  authDomain: 'hunty-test.firebaseapp.com',
  projectId: 'hunty-test',
  storageBucket: 'hunty-test.appspot.com',
  messagingSenderId: '394966442261',
  appId: '1:394966442261:web:62f2560bd63acaa84c091c'
}
export default defineNuxtPlugin(() => {
  return {
    provide: {
      firebase: firebase.apps[0] || firebase.initializeApp(config)
    }
  }
})
