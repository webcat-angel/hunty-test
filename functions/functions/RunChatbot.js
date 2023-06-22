const webcat = require('../webcat.js')
const _ = require('lodash')
const axios = require('axios')
module.exports = async function run (change) {
  const $data = await webcat.parseDelta(change, 'write', 'conversations')
  const { GPTTokens } = require('gpt-tokens')
  const cheerio = require('cheerio')
  if (!$data.after.run) return // VERY IMPORTANT, DO NOT DELETE
  const { questions, answers = [], analysis = [] } = $data.after
  const history = _.flatten(questions.map((content, i) => ([
    { role: 'user', content: JSON.stringify({ question: `${content}` }) },
    ...analysis[i] ? [{ role: 'assistant', content: analysis[i] }] : []
  ])))
  await setStatus('Analyzing question...')
  const { pages, question } = await analyzeQuestion(_.takeRight(history, 3))
  await webcat.database().table('conversations').record($data.after.$id).update({ run: false, analysis: [...analysis, JSON.stringify({ question, pages })] })
  await setStatus(`Searching in Wikipedia...`)
  console.log(pages)
  const links = _.compact(await Promise.all(pages.map(searchWikipedia)))
  await setStatus(`Fetching ${links.length} Wikipedia results...`)
  const contexts = await Promise.all(links.map(async link => ({ text: await fetchLinkText(link), link })))
  let extractedCitations = 0
  await setStatus(`Extracting citations...`)
  const citations = _.reverse(_.takeRight(_.sortBy(_.flatten(await Promise.all(contexts.map(async ({ link, text }) => {
    const result = await getCitationsFromContext({ link, text, question })
    extractedCitations += result.length
    await setStatus(`Extracted ${extractedCitations} citations...`)
    return result
  }))), 'relevanceToQuestion'), 3))
  await setStatus('Building answer...')
  const finalAnswer = citations.length ? await buildAnswer(citations, question) : [{ textFragment: 'Sorry, I couldn\'t find any relevant citations.' }]
  await webcat.database().table('conversations').record($data.after.$id).update({ run: false, answers: [...answers, finalAnswer] })
  await setStatus('')
  return 
  async function analyzeQuestion (history = []) {
    const prompt = `Construct a JSON as your answer that, based on the user's most recent input and the provided conversation history, reformulates the user's latest question to align with the initial query context. If the user asks "How about for 'this other thing'?", interpret this as an implicit request to explore a similar line of questioning for a different subject. Generate a specific question that upholds the continuity of the dialogue and mirrors the conversational context. If there is no conversation history, just return the user's question as is. Additionally, provide and a list of 1, 2 or 3 Wikipedia pages where we can find the answer to the question. Answer in the following JSON format and nothing else:\n{\n  "question": "The extracted question from the user (must be empty if you can't identify a question)",\n  "pages": [\n    "Wikipedia Page Name",\n    ... // Other pages (should be empty if there is no question)\n  ]\n}`
    const messages = [
      { role: 'system', content: prompt },
      ...history
    ]
    const response = callGPT(messages)
    return response
  }
  async function searchWikipedia (query) {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&namespace=0&limit=5&formatversion=2`
    const { data } = await axios.get(url)
    const [response] = data[3]
    return response
  }
  async function fetchLinkText (link) {
    const { data } = await axios.get(link)
    const $ = cheerio.load(data)
    $('script').remove()
    $('style').remove()
    $('.reflist').remove()
    // $('.reference').remove()
    $('.refbegin').remove()
    $('.sistersitebox').remove()
    $('[role=navigation]').remove()
    return $('.mw-parser-output').text()
  }
  async function getCitationsFromContext ({ link, text, question }) {
    const prompt = `Select the all relevant citations from the context that can be used to answer the provided question, and copy them as is. Only cite relevant facts.\nAnswer in the following JSON format and nothing else:\n[\n  {\n    "citation": "One sentence from the context copied exactly as is",\n    "relevanceToQuestion": 0.2 // From 0 to 1\n  },\n  ... // Other answers\n]`
    const promptTexts = splitText(text, 5000)
    const messagesArray = promptTexts.map(promptText => [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify({
        question,
        context: promptText
      }) }
    ])
    const citations = _.flatten(await Promise.all(messagesArray.map(messages => callGPT(messages, 'gpt-4', 0.1).catch(e => []))))
    return _.reverse(_.takeRight(_.sortBy(citations.map(({ citation, relevanceToQuestion }) => ({
      citation,
      relevanceToQuestion,
      url: `${link}#:~:text=${encodeURI(citation)
        .split('%20%20').join('%20')
        .split('–').join('%E2%80%93%')
        .split('-').join('%2D')
        .split(',').join('%2C')
      }`
    })), 'relevanceToQuestion'), 3))
  }
  async function buildAnswer (citations, question) {
    const prompt = `Construct a JSON array of answer fragments in simple and friendly terms to the provided question using the provided citations. The user will see all text fragments joined together as a single paragraph, and each fragment will have an associated link to the corresponding citation.\nAnswer in the following JSON format and nothing else:\n[\n  {\n    "textFragment": "Friendly text fragment",\n    "citationUrl": ""\n  },\n  // Text fragments with their citation\n]`
    const messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify({ question, citations }) }
    ]
    const response = await callGPT(messages, 'gpt-3.5-turbo', 0.5)
    return JSON.stringify(response)
  }
  async function smartJSONParse (jsonString, error) {
  
  }
  async function callGPT (messages, model = 'gpt-3.5-turbo', temperature = 0, retries = 2) {
    const token = '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'
    try {
      const { data: { choices: [{ message: { content } }] } } = await axios.post('https://api.openai.com/v1/chat/completions', {
        model,
        temperature,
        messages
      }, { headers: { Authorization: `Bearer ${token}` } })
      return JSON.parse(content)
    } catch (e) {
      console.error(e.message, e.response?.data)
      if (retries > 0) {
        return callGPT(messages, model, temperature, retries - 1)
      } else {
        throw new Error('Invalid response from GPT')
      }
    }
  }
  function splitText (text, tokens = 5000) {
    let result = []
    let currentText = ''
    let words = text.split(' ')
    _.each(_.chunk(words, 500), chunk => {
      let currentTextTokens = countTokens(currentText + ' ' + chunk.join(' '))
      if (currentTextTokens <= tokens) {
        currentText += ' ' + chunk.join(' ')
      } else {
        result.push(currentText)
        currentText = chunk.join(' ')
      }
    })
    result.push(currentText)
    return result
  }
  function countTokens (text) {
    return new GPTTokens({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: text }]
    }).usedTokens
  }
  async function setStatus (status) {
    return webcat.database().table('conversations').record($data.after.$id).update({ run: false, status })
  }
}