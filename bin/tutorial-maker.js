#!/usr/bin/env node

const puppeteer = require('../lib/puppeteer')
const commandLine = require('../lib/commandLine')
const fs = require('fs')
const { exec } = require('child_process')

const has = Object.prototype.hasOwnProperty


async function main() {
  const width = 1600
  const height = 800

  const writeObjects = {}
  let currentWrite = ''


  const reader = new commandLine({
    completer: true,
    commands: ['snap', 'quit', 'cd', 'write'],
    commandFunctions: {
      DEFAULT: async (ref, command, args, input) => {
        // if command not found it passes everything from user input to DEFAULT
        exec(input, (err, stdout, stderr) => {
          if (err) {
            console.warn(err)
          }

          console.log(stdout)
          console.log(stderr)
        })
      },
      write: async (ref, args) => {
        let file = ''
        let text = ''

        if (has.call(args.object, 'file')) {
          file = args.object.file
        } else if (has.call(args.object, 'f')) {
          file = args.object.f
        }

        text = args.list.join(' ')

        if (file) {
          // user specified a file
          currentWrite = file
          if (has.call(writeObjects, currentWrite)) {
            // already exists, so append to the write string
            writeObjects[currentWrite] = `${writeObjects[currentWrite]}${text}\n`
          } else {
            writeObjects[currentWrite] = `${text}\n`
          }
        } else if (currentWrite) {
          // if user did not specify a file, they want to keep
          // writing to the currentWrite file
          writeObjects[currentWrite] = `${writeObjects[currentWrite]}${text}\n`
        }
      },
      quit: async (ref, args) => {
        await browser.quit()
        ref.quit()
      },
      cd: async (ref, args) => {
        const dir = args.list[0]

        process.chdir(dir)
        console.log(`Currently inside directory: ${process.cwd()}\n`)
      },
      snap: async (ref, args) => {
        const { object, list } = args
        let filename = args.list[0]
        let prefix = '.'
        if (has.call(object, 'path')) {
          prefix = object.path
        }
        if (has.call(object, 'name')) {
          filename = object.name
        }
        if (filename.length) {
          if (!fs.existsSync(prefix)) {
            fs.mkdirSync(prefix)
          }

          if (filename.slice(-4) !== '.png' && filename.slice(-4) !== '.jpg') {
            filename = `${filename}.jpg` // default to jpg if user does not provide a type
          }

          try {
            await browser.page.screenshot({ path: `${prefix}/${filename}` })
            console.log(`Successfully saved screenshot to: ${prefix}/${filename}\n`)
          } catch (e) {
            console.warn(`Failed to save screenshot to: ${prefix}/${filename}`)
            console.warn(e)
            console.warn('\n')
          }
        } else {
          console.warn(`Must specify a file name\n`)
        }
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
