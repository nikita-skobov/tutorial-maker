'use strict';

const puppeteer = require('puppeteer')

class Puppeteer {
  constructor(opts) {
    this.browser = null
    this.page = null
    this.opts = opts
  }

  async init() {
    const { width, height } = this.opts
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        `--window-size=${ width },${ height }`,
      ],
    })
    console.log(this.browser.pages())
    this.browser.pages().forEach((page) => {
      console.log(page)
    })
  }

  async quit() {
    await this.browser.close()
  }
}

module.exports = Puppeteer
