const puppeteer = require('puppeteer')

async function main() {
  const width = 1000
  const height = 800

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--window-size=${ width },${ height }`,
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({ width, height })
  await page.goto('https://collabopath.com')
  await page.screenshot({ path: 'test.png' })


  setTimeout(async () => {
    await browser.close()
  }, 10000)
}

main()
