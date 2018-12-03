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

    this.page = await this.browser.newPage()
    await this.page.setViewport({ width, height })
    await this.page.goto('about:blank')
  }

  async quit() {
    await this.browser.close()
  }
}

module.exports = Puppeteer
