const MongoClient = require('mongodb').MongoClient;
const delay = require('delay');
const { resolve } = require('path');

class Mongo{

	constructor(creds){
		let self = this;
		if(typeof(creds) == "object")
			var uri = `mongodb+srv://${creds.user}:${creds.pass}@clustser0.4q6xbeb.mongodb.net/?retryWrites=true&w=majority`
		else
			var uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.4q6xbeb.mongodb.net/?retryWrites=true&w=majority`
		const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect(err => {
		  if(!err){
		  	console.log("mongodb database connected");
		  	self.client = client;
		  }
		  else
		  	console.log(err)
		});
		//deprecated one
		/*MongoClient.connect(uri, function(err, client) {
		if(err) {
	    	console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
	  	}
		console.log("mongodb database connected");
		self.client = client;
		})*/
	}

	async awaitClient(){
		while(!this.client)
			await delay(500);
	}

	listSales(){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection('Sales').find().toArray().then(docs=>{
				resolve(docs);
			})
		})
	}



	/*
item_code
order_id
total_price_in_rs
receipt_ID
quantity
quantity_unit
purchaser_email
purcahser_name

	*/

    getUser(email){ //UID- User ID, GID - Guild ID
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db("thumbnail_generator").collection("users").findOne({usersEmail:email})
			.then(doc=>{
				if(doc)
					resolve(doc)
				else{
					var e = new Error("Document of Specified User with Guild does not Exist")
					e.code = 404

					reject(e)
					//Identify this error with .catch(err=>if(err.code==404)//things)
				}
			})
			.catch(err=>{
				reject(err)

			})
		})
	}

    addUser(email){
        return new Promise(async(resolve,reject)=>{
            await this.awaitClient();
            
                this.getUser(email).then(doc=>{

                    this.client.db("thumbnail_generator").collection("users").updateOne({usersEmail:email},{
                        $inc:{"thumbnailsCreated":1}
                    })
                    .then(dat=>{
                        resolve(dat)
                    })
                    .catch(err=>{
                        reject(err);
                    })
                })
                .catch(err=>{
                    if(err.code==404)
                        this.client.db('thumbnail_generator').collection("users").insertOne({
                            usersEmail:email,
                            thumbnailsCreated:1
                        }).then(()=>{
                            resolve();
                        })
                        .catch(err=>{
                            console.log(err)
                        })
                })
            })
            
        
    }

    addThumbnail(id,email,thumbnail){
        return new Promise(async(resolve,reject)=>{
            await this.awaitClient();
            
            this.client.db('thumbnail_generator').collection('thumbnails').insertOne({
                id:id,
                usersEmail:email,
                thumbnail:thumbnail
            }).then(()=>{
                console.log("thumbnail added")
                resolve();
            })
        })
    }

    addFeedback(email,feedback){
        return new Promise(async(resolve,reject)=>{
            await this.awaitClient();
            this.client.db('thumbnail_generator').collection('feedback').insertOne({
                email:email,
                feedback:feedback
            }).then(()=>{
                resolve();
            })
        })
    }

	addOrder(itemCode,itemName, orderID, totalPriceInRs,/*  receiptID, */ quantity,quantityUnit, purchaserEmail, purchaserName){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection("Stocks").insertOne({
				item_code: itemCode,
				item_name:itemName,
				order_id: orderID,
				total_price_in_rs: totalPriceInRs,
				/* receipt_ID: receiptID, */
				quantity,
				quantity_unit:quantityUnit,
				purchaser_email:purchaserEmail,
				purchaser_name:purchaserName,
				approval:false
			}).then(()=>{
				resolve();
			})
		})
	}

	orderApproval(orderID,approval){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db('katsu').collection("Sales").updateOne({order_id:orderID},{approval:approval}).then(()=>{
				resolve();
			})
		})
	}

	deleteOrder(orderID){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db('katsu').collection('Sales').deleteOne({order_id:orderID}).then(()=>{
				resolve();
			})
		})
	}

	listStocks(){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection('Stocks').find().toArray().then(docs=>{
				resolve(docs);
			})
		})
	}

	addItem(itemName,itemCode, stocks, stockUnit, pricePerUnit, itemType){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection("Stocks").insertOne({item_name:itemName,item_code:itemCode,stocks:stocks,stock_unit:stockUnit,item_type:itemType,price_per_unit:pricePerUnit}).then(()=>{
				resolve();
			})
		})
	}

	deleteItem(itemCode){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db('katsu').collection('Stocks').deleteOne({item_code:itemCode}).then(()=>{
				resolve();
			})
		})
	}

	changeStockName(itemCode, itemName){
		return new Promise(async(resolve, reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection("Stocks").updateOne({item_code:itemCode},{item_name:itemName}).then(dat=>{
				resolve(dat);
			})
			.catch(err=>{
				reject(err)
			})
		})
	}

	changeStocks(itemCode, stockValue){
		return new Promise(async(resolve, reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection("Stocks").updateOne({item_code:itemCode},{stocks:stocks+stockValue}).then(dat=>{
				resolve(dat);
			})
			.catch(err=>{
				reject(err)
			})
		})
	}

	changeStockType(itemCode, stockType){
		return new Promise(async(resolve, reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection("Stocks").updateOne({item_code:itemCode},{item_type:stockType}).then(dat=>{
				resolve(dat);
			})
			.catch(err=>{
				reject(err)
			})
		})
	}

	changePricePerUnit(itemCode, pricePerUnit){
		return new Promise(async(resolve, reject)=>{
			await this.awaitClient();
			this.client.db("katsu").collection("Stocks").updateOne({item_code:itemCode},{item_type:stockType}).then(dat=>{
				resolve(dat);
			})
			.catch(err=>{
				reject(err)
			})
		})
	}

	addPointsToUser(UID, GID, point){
		return new Promise(async(resolve, reject)=>{
			await this.awaitClient();
			this.getUser(UID,GID).then(doc=>{
				this.client.db("carrybot").collection("discord_users").updateOne({UID:UID,GID:GID},{
					$inc:{points:point}
				})
				.then(dat=>{
					resolve(dat)
				})
				.catch(err=>{
					reject(err);
				})
			})
			.catch(err=>{
				if(err.code==404)
					this.client.db("carrybot").collection("discord_users").insertOne({UID:UID,GID:GID,points:point})
			})

		})
	}

	getGuildLBoard(GID){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			var list = await this.client.db("carrybot").collection("discord_users").find({GID:GID},{"UID":1,"points":1}).sort({points:-1}).limit(10).toArray().then(docs=>{
				resolve(docs);
			})
		})
	}

	getGuildUsers(GID){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db("carrybot").collection("discord_users").find({GID:GID}).toArray().then(docs=>{
				resolve(docs);
			}).catch(err=>{
				reject(err);
			})
		})
	}

	setPointsOfUser(UID, GID, point){
		return new Promise(async(resolve, reject)=>{
			await this.awaitClient();
			this.getUser(UID,GID).then(doc=>{
				this.client.db("carrybot").collection("discord_users").updateOne({UID:UID,GID:GID},{points:point})
				.then(dat=>{
					resolve(dat)
				})
				.catch(err=>{
					reject(err);
				})
			})
			.catch(err=>{
				if(err.code==404)
					this.client.db("carrybot").collection("discord_users").insertOne({UID:UID,GID:GID,points:point})
			})

		})
	}

	async getStats(){
		return new Promise(async(resolve,reject)=>{
			await this.awaitClient();
			this.client.db("carrybot").collection("users").stats().then(data=>{
				resolve(data)
			})
			.catch(err=>{
				reject(err)
			})
		})
	}


	//test-procedure for testing Mongo Connect and manupulating data and collections manually
	async test(){
		var self=this;
		return new Promise(async(resolve, reject)=>{
			await self.awaitClient();
			resolve(self.client)
		})
	}


}

module.exports = Mongo;