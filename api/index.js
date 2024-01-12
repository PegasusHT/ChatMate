const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Bot = require('./models/Bot');
const Message = require('./models/Message');
const MessageBot = require('./models/MessageBot');
const jwt = require('jsonwebtoken');
const cors =require('cors');
const ws = require('ws');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const axios = require('axios');

dotenv.config();
mongoose.connect(process.env.MONGO_URL)
  .catch((err) => console.log(err));
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app= express();
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  // origin: true,
  origin: ['https://chatmate-client.onrender.com', 'http://localhost:3000'],
  // origin: [process.env.CLIENT_URL, process.env.LOCAL_CLIENT_URL],
}));
// console.log('cors', process.env.CLIENT_URL);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject('no token');
    }
  });
}

app.get('/messages/:userId', async (req,res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender:{$in:[userId,ourUserId]},
    recipient:{$in:[userId,ourUserId]},
  }).sort({createdAt: 1});
  res.json(messages);
}); 

app.get('/messages/bot/:botId', async (req, res) => {
  const { botId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await MessageBot.find({
    sender: { $in: [ourUserId, botId] },
    recipient: { $in: [ourUserId, botId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get('/people', async (req,res) => {
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const users = await User.find({_id: {$ne: ourUserId}}, {'_id':1,username:1});
  res.json(users);
});

app.get('/bot', async (req,res) => {
  const bots = await Bot.find({}, {'_id':1,botname:1});
  res.json(bots);
});

app.get('/profile', (req,res) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        res.json(userData);
      });
    } else {
      // console.log(req.cookies)
      res.status(401).json('no token');
    }
});

app.post('/login', async (req,res) => {
  const {username, password} = req.body;
  const foundUser = await User.findOne({username});
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
        res.cookie('token', token, {sameSite:'none', secure:true}).json({
          id: foundUser._id,
        });
      });
    }
  }
});

app.post('/logout', (req,res) => {
  res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
});

app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username:username,
      password:hashedPassword,
    });
    jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        id: createdUser._id,
      });
    });
  } catch(err) {
    if (err) throw err;
    res.status(500).json('error');
  }
});

app.get('/proxy/:message', async (req, res) => {
  try {
    const response = await axios.get(`https://simsimi.fun/api/v2/?mode=talk&lang=en&message=${req.params.message}&filter=True`);
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

const port = process.env.PORT || 4040;
const server = app.listen(port);
const wss = new ws.WebSocketServer({server});
// const wss = new ws.Server({ port: port });
wss.on('connection', (connection, req) => {

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      // console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });

  // read username and id form the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const {userId, username} = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString());
    const {recipient, text, file, userToUser,sendToBot,sendFromBot, botSender} = messageData;
    let filename = null;
    if (file) {
      // console.log('size', file.data.length);
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      filename = Date.now() + '.'+ext;
      const path = __dirname + '/uploads/' + filename;
      const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
      fs.writeFile(path, bufferData, () => {
        console.log('file saved:'+path);
      });
    }
    
    if(userToUser) {
      if (recipient && (text || file)) {
        const messageDoc = await Message.create({
          sender:connection.userId,
          recipient,
          text,
          file: file ? filename : null,
        });
        // console.log('created message');
        [...wss.clients]
          .filter(c => c.userId === recipient)
          .forEach(c => c.send(JSON.stringify({
            text,
            sender:connection.userId,
            recipient,
            file: file ? filename : null,
            _id:messageDoc._id,
          })));
      }
    } 

    if(sendToBot) {
      if (recipient && text) {
        const messageDoc = await MessageBot.create({
          sender: connection.userId,
          recipient,
          text,
        });
        // console.log('created message');
        [...wss.clients]
          .filter(c => c.userId === recipient)
          .forEach(c => c.send(JSON.stringify({
            text,
            sender:connection.userId,
            recipient,
            _id:messageDoc._id,
          })));
      }
    }

    if(sendFromBot) {
      if (text) {
        const messageDoc = await MessageBot.create({
          sender: botSender,
          recipient: connection.userId,
          text,
        });
        [...wss.clients]
          .filter(c => c.userId === recipient)
          .forEach(c => c.send(JSON.stringify({
            text,
            sender:botSender,
            recipient: connection.userId,
            _id:messageDoc._id,
          })));
      }
    
    }
    
  });

  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});

app.get('/test', (req, res) => {
  console.log("server is running")
});