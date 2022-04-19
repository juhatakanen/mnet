const express = require("express")
// // const bot = require('./bot')
const axios = require("axios")
const app = express()
const path = require('path')
const puppeteer = require('puppeteer')
const { Cluster } = require('puppeteer-cluster');
const { title } = require("process")

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, '/views'))

const headlessState = false

app.get("/", async (req, res) => {
 let dataToEJS = await getData()
 let dataToEJSSorted = []
 for(let data of dataToEJS) {
   for(let name of data) {
    dataToEJSSorted.push(name)
   }
 }
 dataToEJSSorted.sort()
//  console.log(dataToEJS);
  res.send(dataToEJSSorted);
});

const sahkokitarat = '?type=sell&category=8'
const seiskat = '?type=sell&category=10'
const baritonit = '?type=sell&category=11'

let categoryToSearch = baritonit




async function getData() {
            let dataToEJS = []

            const numbertoreturn = await maxPageNumber()
            const parsedMaxNumber = (/(?<=\()(.*?)(?=\))/.exec(numbertoreturn))[0]
            console.log(parsedMaxNumber);

            const cluster = await Cluster.launch({
              concurrency: Cluster.CONCURRENCY_CONTEXT,
              maxConcurrency: 6,
              puppeteerOptions: {
                headless: headlessState
                // slowMo: 250
              }
            });

            for (let i = 0; i < parsedMaxNumber; i+=15 ) {
             await cluster.queue(`https://muusikoiden.net/tori/${categoryToSearch}&offset=${i}`);
            }

            await cluster.task(async ({ page, data: url }) => {
              await page.goto(url);
              const data = await page.evaluate(() => {
                let gtrTitleArray = []
                const gtrTitles = document.querySelectorAll(".tori_title a")
                const prices = document.querySelectorAll(".msg")
                const parsedPrices = []

                prices.forEach((price) => {
                 parsedPrices.push(price.nextElementSibling.innerText)
                })
                const regexPrices = []
                parsedPrices.forEach((parsedPrice) => {
                  let reqexPrice = (/(?<=:)(.*?)(?=\€)/.exec(parsedPrice))[0]
                  regexPrices.push(parseInt(reqexPrice))
                })
//                 prices.forEach((price) => {
// gtrTitleArray.push(price.innerHTML)
//                 })
                const pageNumber = document.querySelector("b")

                for (let i = 0; i < gtrTitles.length; i++) {
                  gtrTitleArray.push(`${pageNumber.innerHTML} ${gtrTitles[i].innerHTML} ${regexPrices[i]}`)
                }
                // gtrTitles.forEach((title) => {
                //   let i = 0
                //     gtrTitleArray.push(pageNumber.innerHTML + ' ' + title.innerHTML + ' ' + prices[i].nextElementSibling.innerHTML)
                //     i++
                // })
                return gtrTitleArray
              })
            dataToEJS.push(data)
            });

            await cluster.idle();
            await cluster.close();
            return(dataToEJS);
}



const maxPageNumber = async () => {
  const browser = await puppeteer.launch({
    headless: headlessState,
  })
  const page = await browser.newPage()
  await page.goto(`https://muusikoiden.net/tori/${categoryToSearch}`, {
    waitUntil: 'networkidle2'
  })
  const maxPageNumber = await page.evaluate(() => {
    const number = document.querySelector(".light")
    return number.innerHTML
  })
  browser.close()
  return maxPageNumber
}







let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);