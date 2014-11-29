// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://dbuser1:H31senberg@ds063859.mongolab.com:63859/mongodb1'); // connect to our database
var User = require('./app/models/user');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// log everytime someone hits the server
	//console.log('Something hit the server');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

router.route('/scores')
	.options(function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
	})
	.get(function(req, res){
		var query = User.find({}).sort({currentHighscore: -1}).limit(10);
		query.select('currentHighscore username');
		query.exec(function(err, scores){
			res.header('Access-Control-Allow-Origin', '*');
			res.json(scores);
		});
	});

router.route('/score/:username')
	.options(function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "PUT,DELETE");
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.json({message:'work'});
	})
	.put(function(req, res){
		User.find({username: req.params.username}, function(err, user) {
			if (err) {
				res.send(err);
			}
			else {
				user[0].currentHighscore = req.body.newHighscore;
				user[0].save(function(err) {
					if (err) {
						res.send(err);
					}else {
						res.header("Access-Control-Allow-Origin", "*");
						res.json({ message: 'Updated Highscore for '+req.params.username });
					}
				});
			}

		});
	})
	.delete(function(req, res){
		User.find({username: req.params.username}, function(err, user){
			if(err){
				res.send(err);
			} else{
				user[0].currentHighscore = 0;
				user[0].save(function(err){
					if(err){
						res.send(err)
					} else{
						res.header('Access-Control-Allow-Origin', '*');
						res.json({ message: 'Reset highscore for ' + req.params.username + ' to 0'})
					}
				})
			}
		});
	});

router.route('/position/:username').
	get(function(req, res){
		User.find({username: req.params.username}, function(err, user) {
			if (err){
				res.send(err);
			}else {
				var userHighscore = user[0].currentHighscore;
				var query = User.count({}).where('currentHighscore').gt(userHighscore);
				query.exec(function(err, count){
					count = count + 1;
					res.header('Access-Control-Allow-Origin', '*');
					res.json(count);
				});
			}
		});
	});


// on routes that end in /users
// ----------------------------------------------------
router.route('/users')
	.options(function(req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header("Access-Control-Allow-Methods", "POST, GET");
		res.json({message:'work'});
	})
	// create a user (accessed at POST http://localhost:8080/users)
	.post(function(req, res) {
		User.find({username: req.body.newUsername}, function(err, user) {
			if (err){
				res.send(err);
			}else if(user.length == 0){
				var user = new User();		// create a new instance of the User model
				user.username = req.body.newUsername;  // set the users name (comes from the request)
				
				user.save(function(err) {
					if (err) {
						res.send(err);
					}else {
						res.header('Access-Control-Allow-Origin', '*');
						res.json({ created: true });	
					}
					
				});
			} else{
				res.header('Access-Control-Allow-Origin', '*');
				res.json({ created: false, reason:'This username is taken'})
			}
		});
		
		

		
	})

	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);
			res.header("Access-Control-Allow-Origin", "*");
			res.json(users);
		});
	});

// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/users/:username')

	// get the user with that id
	.get(function(req, res) {
		User.find({username: req.params.username}, function(err, user) {
			if (err){
				res.send(err);
			} else {
				res.header("Access-Control-Allow-Origin", "*");
				res.json(user);
			}
		});
	})

	// delete the user with this id
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);
			res.header("Access-Control-Allow-Origin", "*");
			res.json({ message: 'Successfully deleted' });
		});
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================

// OPENSHIFT PICKUP CHANGE
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
app.listen( port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});


// app.listen(port);
// console.log('Server is running on port: ' + port);
