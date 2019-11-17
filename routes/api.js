/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var mongoose = require('mongoose')
var stockClass = require('../controllers/stockHandler.js')

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology:true})

const stockSchema = mongoose.Schema
const stockModel = new stockSchema({
  stock: String,
  likes: Number
})

var stock = mongoose.model('stock', stockModel)



module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      //{ stock: [ 'amd', 'msft' ] }
      if (typeof req.query.stock != 'string') {
        var ticker = req.query.stock[0]
        var ticker2 = req.query.stock[1]
      }
      else {var ticker = req.query.stock}
      
      var like = req.query.like
      let freshStock = new stockClass(ticker)
      var price = await freshStock.getPrice(ticker)
      var likes1 = 0
      if (ticker2) {
        var price2 = await freshStock.getPrice(ticker2)
        var likes2 = 0
        }
      //console.log("testing return")
      //console.log('price = ' + price)
      stock.find({stock: {$in: [ticker, ticker2]}}, function(err,docs) {
        //console.log(docs.length==1 && typeof ticker2 != 'undefined')
        if (err) {res.send('error finding stock')} 
        else {
          //initialize stock in mongodb if neither stock exists yet.
          if (docs.length==0) {
            var stock1 = new stock({stock: ticker, likes: 0})
            stock1.save()
            if (ticker2) {
              var stock2 = new stock({stock: ticker2, likes: 0})
              stock2.save()
            }
            docs = [stock1, stock2]
          }
          //initialize misisng stock if one of them doesn't exist
          else if (docs.length == 1 && ticker2) {
            if (docs[0].stock==ticker) {
              
              var stock2 = new stock({stock: ticker2, likes:0})
              stock2.save()
              docs.push(stock2)
            }
            else {
              var stock1 = new stock({stock:ticker, likes:0})
              stock1.save()
              docs = [stock1, docs[0]]
            }
          }
          //add & save likes.
          if (like) {
            docs[0].likes++
            docs[0].save()
            if (ticker2) {
              docs[1].likes++
              docs[1].save()
            }
          }
          var stockData = {stock: ticker, price: price, likes: docs[0].likes}
          if (ticker2) {
            stockData = [{stock: ticker, price:price, rel_likes:docs[0].likes-docs[1].likes}, {stock:ticker2, price: price2, rel_likes: docs[1].likes-docs[0].likes}]
          }

          res.json(stockData)
        }
      })
      

    });
    
};
