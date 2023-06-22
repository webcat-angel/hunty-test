export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.config.errorHandler = (error, context) => {
    console.info('Main Error Handler', error)
    clearError()
  }
})