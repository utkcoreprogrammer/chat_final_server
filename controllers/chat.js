var Chat = require('../models/chat');




exports.getChatHistory = function(req,res)
{
	var chatData = [{
	created: new Date(),
    content: 'Hi',
    username: 'Chris',
    room: 'php'
  }, {
    created: new Date(),
    content: 'Hello',
    username: 'Obinna',
    room: 'laravel'
  }];


  for (var c = 0; c < chatData.length; c++) {
    var newChat = new Chat(chatData[c]);
    newChat.save(function(err, savedChat) {
      console.log(savedChat);
    });
  }
  res.send('created');
}