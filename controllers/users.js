// var User = require('../models/users');
// var Chat = require('../models/chat');
// var jwt = require('jsonwebtoken');
// var bcrypt = require('bcrypt');
// var myPlaintextPassword = 's0/\/\P4$$w0rD';
// // var secret = "Harry";
// const saltRounds = 8;
// let users;
// let count;
// let chatRooms;
// let messagesArray = [];
// exports.register = function (req, res) {
//     try {
//         myPlaintextPassword = req.body.password ;
//         console.log("inside exports.register");
//         bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
//             console.log("inside bcrypt.hash");
//             if(err)
//             {
//                 console.log("e>>>>>",err);
//             }
//             else
//             {
//                 myPlaintextPassword = hash;
//                 console.log("OK", myPlaintextPassword);
//                 let userData = {
//                     "username": req.body.username,
//                     "email": req.body.email,
//                     "password": myPlaintextPassword
//                 }
//                 delete req.body.password
//                 console.log("req.body.password>>>", req.body.password);
//                 User.create(userData, (err,data) =>
//                 {
//                     console.log("inside user.save function");
//                     if (err) {     
//                         console.log("err");
//                         res.status(500).json(err);
//                         throw err;
//                     } 
//                     else {
//                         let password = data.password;
//                         delete password
//                         res.status(200).json(data);

//                     }
//                 })

//             } 
//         });


//     } catch(e) {
//         console.log("e>>>>>>",e);
//     }
// }

// exports.auth = function (req,res)
// {
//     try
//     {
//         var email = req.body.email;
//         let isPresent = false;
//         let loggedInUser;


//         if(!req.body.email)
//         {
//             res.status(500).json({success: false, message : "Please provide email"});
//             console.log("Email is not provided");

//         }
//         else if(!req.body.password)
//         {
//             res.status(500).json({success: false, message : "Please provide password"});
//             console.log("Password is not provided");

//         }
//         else {
//             console.log("Both are provided");
//             User.findOne({"email" : email}, (err,user) =>
//             {   
//                 console.log("inside findOne");
//                 if(err){
//                     console.log("err>>>>>>",err);
//                     throw err
//                 }
//                 else {  

//                     if(!user){
//                         console.log("Invalid user");
//                         let error = { "error": "User does not exist with email" };
//                         res.status(500).json(error);    
//                     } 
//                     else {
//                         let storedPassword = user.password;
//                         console.log("storedPassword" , storedPassword);
//                         let currentPassword = req.body.password;
//                         console.log("currentPassword" , currentPassword);
//                         console.log("storedPassword" , storedPassword);
//                         bcrypt.compare(currentPassword, storedPassword, (err,match) =>
//                         {
//                             if(match){
//                                 console.log("password matched");
//                                 let payload = user; 
//                                 let secret = "ChatSecret";                                      
//                                 let expiresIn = { expiresIn: 86400 };
//                                 let token = jwt.sign(payload, secret, expiresIn);
//                                 delete user.password
//                                 isPresent = true;
//                                 loggedInUser = {
//                                     username: user.username,
//                                     email: user.email
//                                 } 

//                                 io.sockets.on('connection', function(socket){
//                                     console.log('a user connected',socket.id);
//                                     socket.emit('LOGGED_IN_USER',user);
//                                     socket.on('join', (data) => {
//                                         socket.join(data.room);
//                                         Chat.find({}).toArray((err, rooms) => {
//                                             if(err){
//                                                 console.log(err);
//                                                 return false;
//                                             }
//                                             count = 0;
//                                             rooms.forEach((room) => {
//                                                 if(room.name == data.room){
//                                                     count++;
//                                                 }
//                                             });
//                                             if(count == 0) {
//                                                 Chat.create({ room: data.room, content: [] }); 
//                                             }
//                                         });
//                                     });
//                                     socket.on('message', (data) => {
//                                         console.log('message');
//                                         io.in(data.room).emit('new message', {user: data.user, message: data.message});
//                                         Chat.findOneAndUpdate({room: data.room}, { $push: { content: { user: data.user, message: data.message } } }, (err, res) => {
//                                             if(err) {
//                                                 console.log(err);
//                                                 return false;
//                                             }
//                                             console.log("Document updated", res);
//                                         });
//                                     });
//                                     socket.on('typing', (data) => {
//                                         socket.broadcast.in(data.room).emit('typing', {data: data, isTyping: true});
//                                     });
//                                 });

//                                 // io.emit('LOGGED_IN_USER',user);


//                                 res.status(200).json({"accessToken": token, "currentUser": loggedInUser, isPresent: isPresent})
//                             }

//                             else{
//                                 console.log("password invalid");
//                             }
//                         })

//                     }
//                 }


                
//             })

// }
// }
// catch(e)
// {
//     console.log("exception e>>" , e);
//     res.status(500).json(e)

// }
// }

// exports.getAllUsers = function (req, res)  {
//     try {
//         console.log("inside getall users")
//         User.find({}, (err, users) => {
//             if (err) {
//                 console.log("err>>>", err);
//                 res.status(500).json(err);
//             } else {
//                 console.log("users>>>>>>>", users);
//                 io.emit("All_Users", users);
//                 res.status(200).json(users);
//             }
//         });
//     } catch (e) {
//         res.status(500).json(e);
//     }
// }



