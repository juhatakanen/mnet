const puppeteer = require("puppeteer");

const bot = async () => {
        const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.goto('https://muusikoiden.net/tori/?type=sell&category=10', {
        waitUntil: 'networkidle2'
    })
    const data = await page.evaluate(() => {
        const gtrTitles = document.querySelectorAll(".tori_title a")
        const gtrTitleArray = []
        gtrTitles.forEach((title) => {
            gtrTitleArray.push(title.innerHTML)
        })
        return gtrTitleArray
    })
    await browser.close()
    return data
}

module.exports = bot
