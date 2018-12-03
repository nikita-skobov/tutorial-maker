'use strict';

const readline = require('readline')
const fs = require('fs')

class CommandLine {
  constructor(opts) {
    let stdin = null
    let stdout = null

    if (opts) {
      ({ stdin, stdout } = opts)
    }

    this.interface = readline.createInterface({
      input: stdin || process.stdin,
      output: stdout || process.stdout,
    })

    this.interface.on('line', this.parseLine)
  }

  async parseLine(line) {
    console.log(line)
  }
}

module.exports = CommandLine
