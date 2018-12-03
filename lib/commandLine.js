'use strict';

const readline = require('readline')
const fs = require('fs')

const has = Object.prototype.hasOwnProperty

class CommandLine {
  constructor(opts) {
    let stdin = null
    let stdout = null
    let commands = null
    let commandFunctions = null
    let completer = undefined

    if (opts) {
      ({ stdin, stdout, commands, commandFunctions, completer } = opts)
    }


    if (opts && commands && completer) {
      completer = (line) => {
        const hits = commands.filter((c) => c.startsWith(line))
        const commandsPlusMessage = ['Available commands:\n', ...commands]
        return [hits.length ? hits : commandsPlusMessage, line]
      }
    }

    this.interface = readline.createInterface({
      input: stdin || process.stdin,
      output: stdout || process.stdout,
      completer,
    })

    this.commandFunctions = commandFunctions || {}
    // in case user does not supply commandFunctions object, we
    // still want it to be treated as an object

    this.commands = commands

    this.interface.on('line', (line) => {
      this.parseLine(line)
    })
  }

  argStartIndex(word) {
    // returns the index where the word starts
    // example: --debug would return 2 because the word is debug
    // and starts at index 2

    // returns false if word is not an argument
    if (word.substr(0, 2) === '--') {
      return word.length > 2 ? 2 : false
    }

    if (word.substr(0, 1) === '-') {
      return word.length > 1 ? 1 : false
    }

    return false
  }

  parseArgs(args) {
    let argString = args
    const argObject = {}
    const extraArgs = []

    const wordArr = argString.split(' ')
    // split into array of words    

    let grabNext = false
    let prevArg = ''
    wordArr.forEach((word, index) => {
      if (word.length) {
        // no need to parse an arg if its an empty word

        const argStartIndex = this.argStartIndex(word)
        if (argStartIndex) {
          const arg = word.substr(argStartIndex, word.length)
          argObject[arg] = true
          grabNext = true
          // set it to true so that if the next word is also an argument
          // then this word remains a boolean in the argument object

          prevArg = arg
          // keeps track of this word so the next iteration places the next word
          // in the right key of argObject
        } else if (grabNext) {
          // we are simply storing this current word as a value of
          // the previous argument key
          argObject[prevArg] = word
          grabNext = false
        } else {
          // if its not an argument like --something then
          // simply add it to a list of extra arguments
          // some commands might just need an array of words instead of
          // key value pairs
          extraArgs.push(word)
        }
      }
    })

    return { argObject, extraArgs }
  }

  parseLine(line) {
    if (line.length && this.commands) {
      // if user accidentally pressed ENTER: line.length === 0 so no need to do anything
      // also no need to parse anythinng if user did not specify commands

      let command = null
      let args = ''
      const firstSpaceIndex = line.indexOf(' ')

      if (firstSpaceIndex === -1) {
        // if user enters just the command without any arguments, then
        // the command is just going to be the whole line
        command = line
      } else {
        command = line.substr(0, firstSpaceIndex)
        args = line.substr(firstSpaceIndex + 1, line.length)
      }

      const { argObject, extraArgs } = this.parseArgs(args)
      const argListAndObject = {
        list: extraArgs,
        object: argObject,
      }

      if (this.commands.indexOf(command) !== -1) {
        if (has.call(this.commandFunctions, command)) {
          this.commandFunctions[command](this, argListAndObject)
        } else {
          console.warn(`Cannot find a function handler for command: ${command}\n`)
        }
      } else {
        this.commandFunctions.DEFAULT(this, command, argListAndObject)
      }
    }
  }

  pause() {
    this.interface.pause()
  }

  quit() {
    this.interface.close()
  }

  ask(question) {
    return new Promise((res) => {
      this.interface.question(question, (answer) => {
        return res(answer)
      })
    })
  }
}

module.exports = CommandLine
