<template>
  <div>
    <NuxtPage />
  </div>
</template>
<script>
import { useNuxtApp } from '#app'
import '@/styles.css'
import { setupFirebase } from '@/webcat/firebase'
export default {
  setup () {
    setupFirebase(useNuxtApp().$firebase)
  }
}
</script>
