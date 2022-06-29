const express = require("express");
const MongoClient = require('mongodb').MongoClient;
var cors = require('cors')
require('dotenv').config()
//import { v4 as uuidv4 } from 'uuid';
const {v4:uuidv4} = require('uuid');

const Mongo = require('./mongo.js')
var mongo = new Mongo();

const app = express();
var bodyParser = require('body-parser');
const { MongoDBNamespace } = require("mongodb");

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
app.use(express.static('public'))
app.use(express.static('dist'))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/api/thumbnail/add',cors(),(req,res)=>{
    mongo.addUser(req.body.email).then(()=>{
        let id = uuidv4();
        mongo.addThumbnail(id,req.body.email,req.body.result)
        
    })
})

app.post('/api/feedback/add',(req,res)=>{
    console.log("reach")
    console.log(req.body.topic,req.body.topic1)
    mongo.addFeedback(req.body.topic,req.body.topic1).then(()=>{
        res.end();
    })
})

app.get('/api/order/add',(req,res)=>{
	let { itemCode,orderID, totalPriceInRs, /* receiptID, */ quantity,quantityUnit, purchaserEmail, purchaserName } = req.query;
	if((itemCode || orderID || totalPriceInRs /* || receiptID */ || quantity ||quantityUnit || purchaserEmail || purchaserName))
		mongo.addSales(itemCode,orderID, totalPriceInRs, /* receiptID, */ quantity,quantityUnit, purchaserEmail, purchaserName).then(()=>{
			res.status(200)
			res.end();
		})
	else{
		res.status(204);
		res.end();
	}
})

app.get("/api/order/approval",(req,res)=>{
	let { orderID, approval } = req.query;
	mongo.orderApproval(orderID, approval).then(()=>{
		res.status(200);
		res.end();
	})
})

app.get('/api/sales/list',(req,res)=>{
	mongo.listSales().then((docs)=>{
		res.send(docs);
	})
})

app.get('/api/stocks/list',(req,res)=>{
	mongo.listStocks().then((docs)=>{
		res.status(200);
		res.send(docs);
	})
})

app.get('/api/stocks/add',(req,res)=>{
	let { itemName, itemCode, stocks, stockUnit,pricePerUnit, itemType } = req.query;
	console.log(itemName, itemCode, stocks, stockUnit, pricePerUnit, itemType)
	if(!(itemName || itemCode || stocks || stockUnit || pricePerUnit || itemType)){
		res.status(204);
		res.end();
		return;
	}
	mongo.addStock(itemName, itemCode, stocks, stockUnit, pricePerUnit, itemType).then(()=>{
		res.status(200);
		res.end();
	})
})



app.get('/api/stocks/delete',(req, res)=>{
	let {itemCode} = req.query;
	mongo.deleteItem(itemCode).then(()=>{
		res.end();
	})
})

app.get('/api/sales/delete',(req, res)=>{
	let {orderID} = req.query;
	mongo.deleteOrder(orderID).then(()=>{
		res.end();
	})
})

app.listen(3001,() =>{
    console.log("Server hosted on port 3001")
})

