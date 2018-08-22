var express = require('express');
var app = express();
var http = require('http').Server(app);
io = require('socket.io')(http);
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var router = express.Router();
var userController = require('./controllers/users');


var port = process.env.PORT || 9090;

mongoose.connect("mongodb://localhost:27017/chat", function(err)
{
	if(err)
	{
		console.log("not connected" + err);
	}
	else
	{
		console.log("db connected");
	}
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})
app.use('/Chat', router);
router.use((req, res, next) => {
    next()
})

// router.get('/*', function (req, res) {
// res.json({ message: 'Welcome to Forge', now: + new Date });
// console.log("server.js hitting");

// })
io.on('connection', function(socket){
  console.log('a user connected',socket.id);
  
});


router.post('/user/register', userController.register);
router.post('/user/auth', userController.auth);
router.get('/user/getAllUsers', userController.getAllUsers);



http.listen(port, function(){
  console.log('listening on port ' + port);
});