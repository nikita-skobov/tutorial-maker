#!/usr/bin/env node

const puppeteer = require('../lib/puppeteer')
const commandLine = require('../lib/commandLine')

const pup = new puppeteer({ width: 1000, height: 800 })
pup.init()

setTimeout(() => {
  pup.quit()
}, 5000)

const reader = new commandLine()
