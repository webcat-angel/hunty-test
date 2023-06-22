<template lang="pug">
div
  div(:style="{alignItems: `center`, backgroundColor: `rgba(255, 255, 255, 1)`, display: `flex`, flexDirection: `column`, height: `100vh`, maxHeight: `100vh`, width: `100%`}")
    div(:style="{alignItems: `flex-start`, alignSelf: `stretch`, backgroundColor: `rgba(237, 234, 234, 1)`, display: `flex`, flexDirection: `row`, flexGrow: `1`, gap: `32px`, padding: `23px 32px`}")
      div(:style="{alignItems: `flex-start`, alignSelf: `stretch`, display: `flex`, flexDirection: `column`, gap: `16px`, minWidth: `16rem`}")
        span(:style="{color: `rgba(0, 0, 0, 0.75)`, fontFamily: `Poppins`, fontSize: `20px`, fontWeight: `600`}") Hunty technical test
        Sidenav(:conversationId="conversationId")
      div(:style="{alignItems: `flex-start`, alignSelf: `stretch`, backgroundColor: `rgba(237, 234, 234, 1)`, display: `flex`, flexDirection: `column`, flexGrow: `1`, gap: `10px`, justifyContent: `center`}")
        div(:style="{alignItems: `flex-end`, alignSelf: `stretch`, backgroundColor: `rgba(255, 255, 255, 1)`, borderColor: `rgba(222, 222, 222, 1)`, borderRadius: `8px 8px 8px 8px`, borderStyle: `solid`, borderWidth: `3px 3px 3px 3px`, display: `block`, flexDirection: `column`, flexGrow: `1`, gap: `16px`, maxHeight: `80vh`, overflowY: `auto`, padding: `32px`}")
          div(v-if="conversation.user === $auth.id" :style="{alignSelf: `stretch`, display: `flex`, flexDirection: `column`, gap: `16px`}")
            div(v-for="(question, i) in conversation.questions" :style="{display: `flex`, flexDirection: `column`, gap: `16px`}")
              div(:style="{alignItems: `flex-end`, display: `flex`, flexDirection: `column`, gap: `8px`, justifyContent: `flex-start`}")
                div(:style="{alignItems: `flex-start`, backgroundColor: `rgba(34, 137, 202, 1)`, borderRadius: `8px 8px 8px 8px`, display: `flex`, flexDirection: `row`, gap: `10px`, padding: `4px 12px`}")
                  span(:style="{color: `rgba(255, 255, 255, 1)`, fontFamily: `Poppins`, fontSize: `14px`}") {{question}}
              div(:style="{display: `flex`, flexDirection: `row`}")
                div(:style="{alignItems: `flex-start`, backgroundColor: `rgba(255, 255, 255, 1)`, borderRadius: `8px 8px 8px 8px`, boxShadow: `0px 2px 10px rgba(0, 0, 0, 0.15000000596046448)`, display: `block`, flexDirection: `column`, gap: `4px`, padding: `4px 12px`}")
                  div(v-for="(answer,j) in answers[i]" :style="{alignItems: `flex-start`, display: `inline`, flexDirection: `row`, gap: `4px`, margin: `0rem 0.5rem 0rem 0rem`}")
                    span(:style="{color: `rgba(0, 0, 0, 0.85)`, fontFamily: `Poppins`, fontSize: `14px`}") {{answer.textFragment}}
                    NuxtLink(v-if="answer.citationUrl" :to="`${answer.citationUrl}`" :target="`_blank`")
                      span(:style="{color: `rgba(34, 137, 202, 1)`, fontFamily: `Poppins`, fontSize: `10px`, fontWeight: `600`}") {{j + 1}}
        div(v-if="conversation.status" :style="{alignItems: `center`, alignSelf: `stretch`, display: `flex`, flexDirection: `row`, gap: `8px`}")
          img(:alt="`Hourglass / 24 / Outline`" :src="`data:image/svg+xml;utf8,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M12.6611%2014.0013H11.9945V12.89C11.9924%2012.5085%2011.9248%2012.1302%2011.7948%2011.7715C11.7875%2011.7519%2011.7798%2011.7338%2011.7708%2011.7152C11.6629%2011.4208%2011.5137%2011.1432%2011.3278%2010.8907L10.3945%209.64586C10.1356%209.2991%209.9953%208.87811%209.99447%208.44534V7.77213C9.99599%207.24208%2010.2064%206.734%2010.5801%206.35807L11.0182%205.91992C11.5273%205.40808%2011.8543%204.74332%2011.9491%204.02767C11.9495%204.01839%2011.9544%204.01066%2011.9544%204.0013L11.9526%203.99215C11.9757%203.8502%2011.9897%203.7069%2011.9945%203.56315V2.00133H12.6611C12.838%202.00133%2013.0075%201.93109%2013.1325%201.80607C13.2576%201.68105%2013.3278%201.51148%2013.3278%201.33467C13.3278%201.15785%2013.2576%200.988286%2013.1325%200.863261C13.0075%200.738237%2012.838%200.667999%2012.6611%200.667999H3.32781C3.151%200.667999%202.98143%200.738237%202.8564%200.863261C2.73138%200.988286%202.66114%201.15785%202.66114%201.33467C2.66114%201.51148%202.73138%201.68105%202.8564%201.80607C2.98143%201.93109%203.151%202.00133%203.32781%202.00133H3.99447V3.56315C3.99921%203.7069%204.01321%203.8502%204.03639%203.99215L4.03451%204.00133C4.03451%204.01067%204.03947%204.01843%204.03984%204.0277C4.13461%204.74335%204.46163%205.40811%204.97071%205.91995L5.40886%206.35811C5.78252%206.73403%205.99293%207.2421%205.99447%207.77213V8.44533C5.9936%208.87805%205.85344%209.29899%205.59473%209.64585L4.66081%2010.8906C4.47497%2011.1433%204.32585%2011.421%204.21789%2011.7154C4.20903%2011.7339%204.20141%2011.7518%204.19421%2011.7712C4.06412%2012.13%203.99655%2012.5084%203.99447%2012.89V14.0013H3.3278C3.15099%2014.0013%202.98142%2014.0716%202.85639%2014.1966C2.73137%2014.3216%202.66113%2014.4912%202.66113%2014.668C2.66113%2014.8448%202.73137%2015.0144%202.85639%2015.1394C2.98142%2015.2644%203.15099%2015.3347%203.3278%2015.3347H12.6611C12.8379%2015.3347%2013.0075%2015.2644%2013.1325%2015.1394C13.2576%2015.0144%2013.3278%2014.8448%2013.3278%2014.668C13.3278%2014.4912%2013.2576%2014.3216%2013.1325%2014.1966C13.0075%2014.0716%2012.8379%2014.0013%2012.6611%2014.0013V14.0013ZM5.3278%203.33467V2.00133H10.6611V3.33467H5.3278ZM5.91341%204.97725C5.81948%204.88287%205.7353%204.77927%205.66215%204.668H10.3268C10.2536%204.77927%2010.1695%204.88287%2010.0755%204.97725L9.63737%205.4154C9.11734%205.93237%208.7839%206.60751%208.68945%207.33467H7.29945C7.20503%206.60749%206.87159%205.93232%206.35156%205.41533L5.91341%204.97725ZM6.66146%2010.4453C7.04721%209.92845%207.27594%209.31142%207.32031%208.668H8.66862C8.71296%209.31148%208.94182%209.92856%209.3278%2010.4453L9.99455%2011.3347H5.99422L6.66146%2010.4453ZM10.6611%2014.0013H5.3278V12.89C5.32966%2012.8157%205.33571%2012.7416%205.34595%2012.668H10.643C10.6532%2012.7416%2010.6593%2012.8157%2010.6611%2012.89V14.0013Z%22%20fill%3D%22black%22%20fill-opacity%3D%220.5%22%2F%3E%0A%3C%2Fsvg%3E%0A`" :style="{height: `16px`, width: `16px`}")
          span(:style="{color: `rgba(0, 0, 0, 0.5)`, fontFamily: `Poppins`, fontSize: `12px`, fontWeight: `500`}") {{conversation.status}}
        div(v-if="!conversation.status" :style="{alignItems: `flex-start`, alignSelf: `stretch`, backgroundColor: `rgba(255, 255, 255, 1)`, borderColor: `rgba(222, 222, 222, 1)`, borderRadius: `8px 8px 8px 8px`, borderStyle: `solid`, borderWidth: `3px 3px 3px 3px`, display: `flex`, flexDirection: `row`, gap: `16px`, justifyContent: `flex-end`, padding: `16px`}")
          InputEl(v-model="newText" :placeholder="`Write here...`" :reactive="`true`" :style="{flexGrow: `1`, fontFamily: `Poppins`, fontSize: `16px`, fontWeight: `500`}")
          img(@click="submit()" :alt="`navigation arrow / 24 / Outline`" :src="`data:image/svg+xml;utf8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M20.17%209.23L6.17001%203.45C5.64029%203.23078%205.05884%203.16794%204.49451%203.26891C3.93018%203.36988%203.4066%203.63043%202.98575%204.01972C2.5649%204.40901%202.2644%204.91073%202.11983%205.46549C1.97526%206.02025%201.99268%206.60482%202.17001%207.15L3.71001%2012L2.13001%2016.85C1.94788%2017.3974%201.92742%2017.9856%202.07108%2018.5443C2.21475%2019.103%202.51644%2019.6084%202.94001%2020C3.48465%2020.5051%204.19729%2020.7901%204.94001%2020.8C5.33474%2020.7997%205.72554%2020.7216%206.09001%2020.57L20.14%2014.79C20.6872%2014.5624%2021.1547%2014.1779%2021.4836%2013.6849C21.8125%2013.192%2021.988%2012.6126%2021.988%2012.02C21.988%2011.4274%2021.8125%2010.848%2021.4836%2010.3551C21.1547%209.86209%2020.6872%209.47756%2020.14%209.25L20.17%209.23ZM5.36001%2018.7C5.18361%2018.7728%204.99007%2018.7935%204.80225%2018.7599C4.61442%2018.7262%204.44015%2018.6395%204.30001%2018.51C4.168%2018.3838%204.07304%2018.224%204.02545%2018.0477C3.97785%2017.8714%203.97943%2017.6854%204.03001%2017.51L5.49001%2013H19.22L5.36001%2018.7ZM5.49001%2011L4.00001%206.53C3.94943%206.35455%203.94785%206.1686%203.99545%205.99232C4.04304%205.81603%204.138%205.65615%204.27001%205.53C4.36412%205.43128%204.47742%205.35285%204.60296%205.29954C4.7285%205.24622%204.86362%205.21916%205.00001%205.22C5.13406%205.22026%205.26669%205.24746%205.39001%205.3L19.22%2011H5.49001Z%22%20fill%3D%22black%22%2F%3E%0A%3C%2Fsvg%3E%0A`" :style="{cursor: `pointer`, height: `24px`, width: `24px`}")</template>
<script setup>
useHead({ title: 'Hunty Technical Test' })
import _ from 'lodash'
import moment from 'moment'
import { useRoute } from '#app'
import useAuth from '@/webcat/useAuth.js'
import useWcRouter from '@/webcat/useRouter.js'
import useRecord from '@/webcat/useRecord.js'
import useKeyup from '@/webcat/useKeyup.js'
const $auth = useAuth()
const $router = useWcRouter(useRouter())
useKeyup({ key: 'Enter', ctrl: false, shift: false, alt: false }, () => {
  if (!newText.value.split(' ').join('')) return
  conversation.questions.push(newText.value)
  conversation.run = true
  newText.value = ''
  conversation.$save()
})
const conversationId = useRoute().params.conversationId
let newText = ref('')
const conversation = useRecord({ tableId: 'conversations', recordId: computed(() => useRoute().params.conversationId), expand: [] })
const answers = computed(() => {
  return conversation
    .answers.map(ans => JSON.parse(ans))
})
async function submit () {
  conversation.questions.push(newText.value)
  conversation.run = true
  newText.value = ''
  await conversation.$save()
}
</script>