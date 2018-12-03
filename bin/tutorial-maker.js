#!/usr/bin/env node

const puppeteer = require('../lib/puppeteer')
const commandLine = require('../lib/commandLine')
const fs = require('fs')


async function main() {
  const width = 1600
  const height = 800

  let pathPrefix = '.'

  const reader = new commandLine({
    completer: true,
    commands: ['snap', 'path', 'quit'],
    commandFunctions: {
      quit: async (ref, args) => {
        console.log(args)
        await browser.quit()
        ref.quit()
      },
      path: async (ref, args) => {
        const prefix = args.list[0]
        if (!fs.existsSync(prefix)) {
          fs.mkdirSync(prefix)
        }
        pathPrefix = prefix
      },
      snap: async (ref, args) => {
        const filename = args.list[0]
        await browser.page.screenshot({ path: `${pathPrefix}/${filename}` })
      },
    },
  })

  let browser = null
  let answer = await reader.ask(`Use default width and height: ${width} x ${height}? (Y or N)\n`)

  const acceptedAnswers = ['yes', 'y', '']

  if (acceptedAnswers.indexOf(answer.toLowerCase()) !== -1) {
    // answer exists in acceptedAnswers list, proceed with defaults
    browser = new puppeteer({ width, height })
    browser.init()
  } else {
    let proceed = false
    let userWidth = null
    let userHeight = null

    while (!proceed) {
      answer = await reader.ask('Enter desired width: \n')
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
      answer = await reader.ask('Enter desired height: \n')
      userHeight = parseInt(answer, 10)
      if (!Number.isNaN(userHeight)) {
        // only proceed if height is a number
        proceed = true
      } else {
        console.log(`${answer} is an invalid height\n`)
      }
    }

    browser = new puppeteer({ width: userWidth, height: userHeight })
    browser.init()
  }
}

main()
