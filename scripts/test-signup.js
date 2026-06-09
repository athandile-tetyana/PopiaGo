const puppeteer = require('puppeteer')

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))

  const url = process.env.URL || 'http://localhost:3000/signup'
  await page.goto(url, { waitUntil: 'networkidle2' })

  await page.type('#organization', 'atha')
  await page.type('#email', 'athandiletetyana308@gmail.com')
  await page.type('#password', '1234567')

  await Promise.all([
    page.click('button[type=submit]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
  ])

  const content = await page.content()
  console.log('PAGE CONTENT LENGTH:', content.length)

  await browser.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
