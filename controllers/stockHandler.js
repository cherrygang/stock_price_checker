//external stock api
//https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote
const fetch = require('node-fetch')


function StockHandler(ticker) {
  this.ticker = ticker
  this.getPrice = async function(ticker) {
    var url = "https://repeated-alpaca.glitch.me/v1/stock/"+ticker+"/quote"

    let response = await fetch(url)
    let data = await response.json()
    return await data.latestPrice
  }

}

module.exports = StockHandler;