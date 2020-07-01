const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();

MongoClient.connect('mongodb://localhost:27017/library', function (err, client) {
  if (err) throw err

  var db = client.db('library')

  app.get('/authors/:awards', async (req,res) => {

    var awards = req.params.awards;

        try{
            var result = await db.collection('authors').find({
               awards: {$exists:true}, $where : `this.awards.length>=${awards}`, 
            }).project({'name':1}).toArray();

            res.status(200).send(result);

        }catch(err){

            res.status(400).send(err);
            console.log(err)
        }

    })

    app.get('/awards/:year', async (req,res) => {

        var year = parseInt(req.params.year);
    
            try{
                var result = await db.collection('authors').find({
                   'awards.year': {$gte: year}, 
                }).project({name:1,awards:1,'awards.$.award':1}).toArray();
    
                res.status(200).send(result);
    
            }catch(err){
    
                res.status(400).send(err);
                console.log(err)
            }
    });

    app.get('/profit', async (req,res) => {

            try{
                var result = await db.collection('books').aggregate([
                    {
                        "$lookup":{
                           from: 'authors',
                           localField: 'authorId',
                           foreignField: '_id',
                           as: 'author'
                         }
                    },
                    {
                        "$group" : {
                            _id:'$authorId',
                            totalBooksSold: {$sum:"$sold"},
                            totalProfit: {$sum:{"$multiply":["$sold","$price"]}},
                
                        }
                    }
                
                ]).toArray();
    
                res.status(200).send(result);
    
            }catch(err){
    
                res.status(400).send(err);
                console.log(err)
            }
    });

    app.get('/filter/:dob/:price', async (req,res) => {

        var dob = req.params.dob;
        var price = parseFloat(req.params.price);
    
            try{
                var result = await db.collection('books').aggregate([
                    {
                        $lookup:{
                           from: 'authors',
                           localField: 'authorId',
                           foreignField: '_id',
                           as: 'author'
                        }
                    },
                    {"$unwind":"$author"},
                    {
                        "$group" : {
                            _id:'$authorId',
                            authorDob: {"$first":"$author.birth"} ,
                            totalPrice: {$sum:"$price"},
                
                        }
                    },
                    {"$match":
                        {"totalPrice":{$gte:price}, authorDob:{$gte:new Date(dob)}},
                    }
                
                ]).toArray();
    
                res.status(200).send(result);
    
            }catch(err){
    
                res.status(400).send(err);
                console.log(err)
            }
    });
});
    

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
