<template lang="pug">
div
  div(:style="{alignItems: `center`, backgroundColor: `rgba(255, 255, 255, 1)`, display: `flex`, flexDirection: `column`, height: `100vh`, maxHeight: `100vh`, width: `100%`}")
    div(:style="{alignItems: `flex-start`, alignSelf: `stretch`, backgroundColor: `rgba(237, 234, 234, 1)`, display: `flex`, flexDirection: `row`, flexGrow: `1`, gap: `32px`, padding: `23px 32px`}")
      div(v-if="$auth.id" :style="{alignItems: `flex-start`, alignSelf: `stretch`, display: `flex`, flexDirection: `column`, gap: `16px`}")
        span(@click="$auth.$logout()" :style="{color: `rgba(0, 0, 0, 0.75)`, fontFamily: `Poppins`, fontSize: `20px`, fontWeight: `600`}") Hunty technical test
        Sidenav
      div(:style="{alignItems: `flex-start`, alignSelf: `stretch`, backgroundColor: `rgba(237, 234, 234, 1)`, display: `flex`, flexDirection: `column`, flexGrow: `1`, gap: `10px`, justifyContent: `center`}")
        div(v-if="!$auth.id" :style="{alignItems: `center`, alignSelf: `stretch`, backgroundColor: `rgba(255, 255, 255, 1)`, borderColor: `rgba(222, 222, 222, 1)`, borderRadius: `8px 8px 8px 8px`, borderWidth: `3px 3px 3px 3px`, display: `flex`, flexDirection: `column`, flexGrow: `1`, gap: `16px`, justifyContent: `center`, overflowY: `auto`, padding: `32px`}")
          InputEl(v-model="$auth.email" :placeholder="`email@email.com`" :reactive="`true`" :type="`email`" :style="{borderColor: `rgba(222, 222, 222, 1)`, borderRadius: `0.5rem`, borderStyle: `solid`, borderWidth: `2px`, padding: `0.5rem 1rem`}")
          InputEl(v-model="$auth.password" :placeholder="`Your password`" :reactive="`true`" :type="`password`" :style="{borderColor: `rgba(0, 0, 0, 0.1)`, borderRadius: `0.5rem`, borderStyle: `solid`, borderWidth: `2px`, padding: `0.5rem 1rem`}")
          button(v-if="!showRegistration" @click="$auth.$login()")
            div Login
          button(v-if="showRegistration" @click="$auth.$register()")
            div Create account
          button(v-if="!showRegistration" @click="showRegistration = !showRegistration")
            div I don't have an account
          button(v-if="showRegistration" @click="showRegistration = !showRegistration")
            div I already have an account</template>
<script setup>
useHead({ title: 'Hunty Technical Test' })
import _ from 'lodash'
import moment from 'moment'
import { useRoute } from '#app'
import useAuth from '@/webcat/useAuth.js'
import useWcRouter from '@/webcat/useRouter.js'
import useRecord from '@/webcat/useRecord.js'
const $auth = useAuth()
const $router = useWcRouter(useRouter())
let showRegistration = ref(false)
const user = useRecord({ tableId: 'wc-users', recordId: computed(() => $auth.uid), expand: ['conversations'] })
async function plop () {
  console.log($auth.uid)
}
</script>