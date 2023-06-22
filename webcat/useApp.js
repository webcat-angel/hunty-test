import { reactive, computed } from 'vue'
import { subscribeToDoc } from './firebase'
let subscribed, app
export default () => {
  if (!subscribed) {
    const settings = subscribeToDoc('wc-settings')
    settings.subscribe('settings/default')
    app = reactive({
      settings: computed(() => settings.data),
      loading: computed(() => settings.loading)
    })
  }
  return app
}
