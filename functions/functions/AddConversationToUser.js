const webcat = require('../webcat.js')
const _ = require('lodash')
const axios = require('axios')
module.exports = async function run (change) {
  const $data = await webcat.parseDelta(change, 'create', 'conversations')
  const userRecord = webcat.database().table('wc-users').record($data.after.user)
  const { conversations } = await userRecord.get()
  const updatedConversations = _.uniq([...conversations || [], $data.after.$id])
  await userRecord.update({ conversations: updatedConversations })
}