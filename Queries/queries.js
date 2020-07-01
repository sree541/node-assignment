// Task1
db.authors.find({
	   awards: {$exists:true}, $where : `this.awards.length>=2`, 
	},
	{'name':1}
).pretty();


// Task2
db.authors.find({
	   'awards.year': {$gte: 2007}, 
	},
	{name:1,awards:1,'awards.$.award':1}
).pretty();



//Task3
db.books.aggregate([
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

]).pretty();


// Task4
db.books.aggregate([
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
        {"totalPrice":{$gte:2000}, authorDob:{$gte:new Date('1906-12-09')}},
    }

]).pretty();