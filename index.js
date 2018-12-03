const puppeteer = require('puppeteer')
const readline = require('readline')
const fs = require('fs')

var browser = null
var page = null
var pathPrefix = '.'

async function main({ width, height }) {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--window-size=${ width },${ height }`,
    ],
  })

  page = await browser.newPage()
  await page.setViewport({ width, height })
  await page.goto('https://google.com')
}

function question(RL, question) {
  return new Promise((res) => {
    return RL.question(question, (answer) => {
      RL.pause()
      return res(answer)
    })
  })
}

async function setupBrowser(readlineInterface) {
  const width = 1000
  const height = 800
  const RL = readlineInterface

  let answer = await question(RL, `Use default width and height: ${width} x ${height}? (Y or N)\n`)
  const acceptedAnswers = ['yes', 'y', '']
  if (acceptedAnswers.indexOf(answer.toLowerCase()) !== -1) {
    // answer exists in acceptedAnswers list, proceed with defaults
    RL.resume()
    return main({ width, height })
  }

  let proceed = false
  let userWidth = null
  let userHeight = null
  while (!proceed) {
    answer = await question(RL, 'Enter desired width: \n')
    userWidth = parseInt(answer, 10)
    if (!Number.isNaN(userWidth)) {
      // only proceed if width is a number
      proceed = true
    } else {
      console.log(`${answer} is an invalid width\n`)
    }
  }

  proceed = false
  while (!proceed) {
    answer = await question(RL, 'Enter desired height: \n')
    userHeight = parseInt(answer, 10)
    if (!Number.isNaN(userHeight)) {
      // only proceed if height is a number
      proceed = true
    } else {
      console.log(`${answer} is an invalid height\n`)
    }
  }

  RL.resume()
  return main({ width: userWidth, height: userHeight })
}

const RLInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

RLInterface.on('line', async (line) => {
  let shouldResume = true

  console.log(`line: ${line}`)

  if (line === 'quit') {
    await browser.close()
    RLInterface.close()
    shouldResume = false
  } else if (line === 'snap') {
    let path = await question(RLInterface, 'Enter a file name: \n')
    await page.screenshot({ path: `${pathPrefix}/${path}` })
  } else if (line === 'path') {
    let prefix = await question(RLInterface, 'Enter a directory path: \n')
    if (!fs.existsSync(prefix)) {
      fs.mkdirSync(prefix)
    }
    pathPrefix = prefix
  }

  if (shouldResume) {
    RLInterface.resume()
  }
})

setupBrowser(RLInterface)
// main(RL)
