'use strict';

const readline = require('readline')
const fs = require('fs')

class CommandLine {
  constructor(opts) {
    let stdin = null
    let stdout = null
    let commands = null

    if (opts) {
      ({ stdin, stdout, commands } = opts)
    }

    let completer = undefined

    if (opts && commands) {
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

    this.interface.on('line', this.parseLine)
  }

  async parseLine(line) {
    if (line.length) {
      // if user accidentally pressed ENTER: line.length === 0 so no need to do anything

      let command = null
      const firstSpaceIndex = line.indexOf(' ')

      if (firstSpaceIndex === -1) {
        // if user enters just the command without any arguments, then
        // the command is just going to be the whole line
        command = line
      } else {
        command = line.substr(0, firstSpaceIndex)
      }

      console.log(line)
      console.log(command)
    }
  }
}

module.exports = CommandLine
