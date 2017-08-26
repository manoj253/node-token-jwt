var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var User = require('./models/user');
var config = require('./config');

var apiRouter = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

mongoose.connect(config.database);
app.set('superSecret',config.secret);

app.use(morgan('dev'));

app.get('/',function(req,res){
	res.send("welcome to Nodejs-jwt-tut");
});

app.get('/setup',function(req,res){
	var manoj = new User({
		name : 'manoj',
		password : 'password',
		admin : true
	});
	manoj.save(function(err){
		if(err) throw err;
		console.log("user created successfully");
		res.json({message:true});
	});
});


// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRouter.post('/authentication',function(req,res){
	User.findOne({name:req.body.name},function(err,user){
		if(err) throw err;
		if(!user){
			res.json({message:"not auhterized user"});
		}else if(user){
			if(user.password!=req.body.password){
				res.json({success:false,message:"Invalid password"});
			}else{
				var token = jwt.sign(user,app.get('superSecret'),{expiresIn : '24h'});
				res.json({
					success : true,
					message : "enjoy your token",
					token : token

				});
			}
		}
	});

});

// route middleware to verify a token
app.use(function(req,res,next){
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	// token decode
	if(token){
		// verifies secret and checks exp
		jwt.verify(token,app.get('superSecret'),function(err,decoded){
			if(err){
				res.json({
					success : false,
					message : 'Failed to authenticate token.'
				});
			}else{
				 // if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		})
	}else{
		// if there is no token
    	// return an error
    	return res.status(403).send({
    		success : false,
    		message : "token is not provided"
    	});
	}
});


apiRouter.get('/',function(req,res){
	res.json({message:"welcome api router"});
});

apiRouter.get('/user',function(req,res){
	User.find({},function(err,user){
		if(err) throw err;
		res.json(user);
	});

});



app.use('/api',apiRouter);

app.listen(3000,function(){
	console.log("server iis running on port 3000");
});