// var express = require('express');
// var app = express();
// var http = require('http').Server(app);
// io = require('socket.io')(http);
// var mongoose = require('mongoose');
// var path = require('path');
// var bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// var router = express.Router();
// var userController = require('./controllers/users');
// var chatController = require('./controllers/chat');




// var port = process.env.PORT || 9090;

// mongoose.connect("mongodb://localhost:27017/chat", function(err)
// {
// 	if(err)
// 	{
// 		console.log("not connected" + err);
// 	}
// 	else
// 	{
// 		console.log("db connected");
// 	}
// });

// //





// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next()
// })
// app.use('/Chat', router);
// router.use((req, res, next) => {
//     next()
// })

// // router.get('/*', function (req, res) {
// // res.json({ message: 'Welcome to Forge', now: + new Date });
// // console.log("server.js hitting");

// // })



// router.post('/user/register', userController.register);
// router.post('/user/auth', userController.auth);
// router.get('/user/getAllUsers', userController.getAllUsers);
// // router.get('/chat/setup', chatController.getChatRooms);
// // router.post('chat/setup', chatController.getChatHistory);

// // router.get('/chatroom/:room', (req, res, next) => {
// //     let room = req.params.room;
// //     chatRooms.find({name: room}).toArray((err, chatroom) => {
// //         if(err) {
// //             console.log(err);
// //             return false;
// //         }
// //         res.json(chatroom[0].messages);
// //     });
// // });



// http.listen(port, function(){
//   console.log('listening on port ' + port);
// });

// io.sockets.on('connection', function(socket){
//   console.log('a user connected',socket.id);
  
// });

const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const socket = require('socket.io');
const port = 9090;
var users;
var count;
var chatRooms;
var messages = [];
var messageArray = [];
var chatHistory = [];

const app = express();

app.use(bodyParser.json());

const MongoClient = mongodb.MongoClient;

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin' , 'http://localhost:4200');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append("Access-Control-Allow-Headers", "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.append('Access-Control-Allow-Credentials', true);
    next();
});


MongoClient.connect('mongodb://localhost:27017/Chat_App', (err, Database) => {
    if(err) {
        console.log(err);
        return false;
    }
    console.log("Connected to MongoDB");
    const db = Database.db("Chat_App");
    users = db.collection("users");
    chatRooms = db.collection("chatRooms");
    const server = app.listen(port, () => {
        console.log("Server started on port " + port + "...");
    });
    io = socket.listen(server);

    io.sockets.on('connection', (socket) => {
        socket.on('join', (data) => {
            socket.join(data.room);
            console.log("data>>>>", data);
             chatRooms.find({}).toArray((err, rooms) => {
                if(err){
                    console.log("err>>>>>", err);
                    return false;
                }
                count = 0;
                console.log("rooms>>>>" ,rooms);
                rooms.forEach((room) => {
                    if(room.name == data.room){
   	                    console.log("room >>>", room);
                        count++;
                        messageArray = room.messages
                        socket.emit('getMessages', messageArray);
                    }
                });
                if(count == 0) {
                    console.log("count insert one >>>");
                    chatRooms.insertOne({ name: data.room, messages: [] }); 
                }
            });
        });
        socket.on('message', (data) => {
            io.in(data.room).emit('new message', {user: data.user, message: data.message});
            chatRooms.updateOne({name: data.room}, { $push: { messages: { user: data.user, message: data.message } } }, (err, res) => {
                if(err) {
                    console.log(err);
                    return false;
                }
                console.log("Document updated");
            });
        });
        socket.on('typing', (data) => {
            socket.broadcast.in(data.room).emit('typing', {data: data, isTyping: true});
            // addEventListener("keypress")

        });
    });

}); 

app.get('/', (req, res, next) => {
    res.send('Welcome to the express server...');
});

app.post('/user/register', (req, res, next) => {
	console.log("inside user/register>>>");
    let user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isOnline : false
    };
    let count = 0;    
    users.find({}, (err, Users) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        console.log("Users.find>>>>>>>", Users);
        for(let i = 0; i < Users.length; i++){
            if(Users[i].username == user.username)
            count++;
        }
        // Add user if not already signed up
        if(count == 0){
            users.insertOne(user, (err, User) => {
                if(err){
                    res.send(err);
                }
                res.json(User);
            });
        }
        else {
            // Alert message logic here
            res.json({ user_already_signed_up: true });
        }
    });
    
});

app.post('/user/auth', (req, res) => {
    let isPresent = false;
    let correctPassword = false;
    let loggedInUser;
    console.log('inside user/auth');

    users.find({}).toArray((err, users) => {
        if(err){
        	console.log("err in user auth", err);
        	res.send(err);
        }else{
            users.forEach((user) => {
                console.log('inside users.forEach');

            if((user.email == req.body.email)) {
                if(user.password == req.body.password) {
                    isPresent = true;
                    correctPassword = true;
                    loggedInUser = {
                        username: user.username,
                        email: user.email,
                        isOnline : true

                    }   
                } else {
                    isPresent = true;
                }
            }
        }); 
            io.emit("logged_in_user",loggedInUser);   
            res.json({ isPresent: isPresent, correctPassword: correctPassword, user: loggedInUser });
        }
    });
});

app.get('/user/getAllUsers', (req, res, next) => {
    users.find({}, {username: 1, email: 1, _id: 0}).toArray((err, users) => {
        if(err) {
            res.send(err);
        }
        else
        res.json(users);
    });
});

app.get('/chatroom/:room', (req, res, next) => {
    let room = req.params.room;
    console.log("inside chatroom/:room>>>>>>");
    chatRooms.find({name: room}).toArray((err, chatroom) => {
        if(err) {
            console.log(err);
            return false;
        }
        else{
        console.log("type of chatroom  ", typeof(chatroom));
        res.json(chatroom.message);
        }
    });
});