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

      if (this.commands.indexOf(command) !== -1) {
        if (has.call(this.commandFunctions, command)) {
          this.commandFunctions[command](this, args)
        } else {
          console.warn(`Cannot find a function handler for command: ${command}\n`)
        }
      } else {
        console.warn(`"${command}" is not a valid command`)
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
