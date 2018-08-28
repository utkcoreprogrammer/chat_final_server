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
app.use(bodyParser.urlencoded({ extended: true }));

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
	console.log("inside user/register>>>", req.body);

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
        console.log("Users.find>>>>>>>");
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

                if((user.email == req.body.email)) {
                    if(user.password == req.body.password) {
                        isPresent = true;
                        user.isOnline = true;
                        correctPassword = true;
                        loggedInUser = {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            isOnline : user.isOnline

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

app.post('/user/logOut', (req, res, next) =>
{ 
  console.log("users.logout api hitting");
  let email = req.body;
  console.log("email from api@@@", email);

  users.find({email : req.body},(err, user) =>
    {
        if(err){
        console.log("err in user logOut", err);
        }
        else{
        console.log("inside else of users.find", user);
            
            
            //     user.isOnline = false;
            //     logOutUser = {
            //         id: user._id,
            //         username: user.username,
            //         email: user.email,
            //         isOnline : user.isOnline

            //     }
            // io.emit("log_Out_User",user);   
            // res.status(200).json(user);
        }
    })

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