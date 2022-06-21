const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const crypto = require("crypto");


const TWO_HOURS = 1000 * 60 * 60 * 2

const {
  PORT = 3000,
  NODE_ENV = 'development',

  SESS_NAME = 'sid',
  SESS_SECRET = 'ssh!quiet,it\'asecret!',
  SEES_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'

const users = [
  { id: 1, email: 'ale@gmail.com', password: 'secret' },
  { id: 2, email: 'max@gmail.com', password: 'secret' },
  { id: 3, email: 'tom@gmail.com', password: 'secret' }
]

let notes = [{
  userId:2,
  uuid:"smldfkjaÃ¶lsdkjfÃ¶alskdjfÃ¶alkds,f",
  content:"Homework"
}];

const app = express()

app.use(bodyParser.json())

app.use(session({
  name: SESS_NAME,
  resave: false,
  saveUninitialized: false,
  secret: SESS_SECRET,
  cookie: {
    maxAge: SEES_LIFETIME,
    sameSite: true,
    secure: IN_PROD
  }
}))

app.use("/", express.static(__dirname + '/public'));


app.use((req, res, next) => {
  const { userId } = req.session
  if (userId) {
    res.locals.user = users.find(
        user => user.id === userId)
  }
  next()
})

app.get("/getProfile",(req,res)=>{
  const { userId } = req.session;
  if(userId != null){
    res.send(true);
  }else{
    res.send(false);
  }
});

app.get("/main",(req,res) => {
  res.sendFile(__dirname + "/public/main.html");
});

app.get('/',  (req, res) => {
  res.sendFile(__dirname + "/public/main.html");
});

app.post('/login', (req, res) => {
  const { email, password } = req.body
  console.log(req.body);
  if (email && password) {
    const user = users.find(
        user => user.email === email && user.password === password)
    if (user) {
      req.session.userId = user.id
      return res.send({status:true});
    }
  }
  return res.send({status:false});
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    const exists = users.some(
        user => user.email === email
    )

    if (!exists) {
      const user = {
        id: users.length + 1,
        email,
        password
      }

      users.push(user)
      req.session.userId = user.id

      return res.send({status:true})
    }
  }
  return res.send({status:false})
})

app.delete('/session', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/')
    }
    res.clearCookie(SESS_NAME)
    res.send("ok");
  })
})

app.get("/tasks",(req,res)=>{
  const { userId } = req.session;
  if(userId != null){
    let userNotes = notes.filter((notiz)=>{
      return notiz.userId = userId;
    });
    res.send(userNotes);
  }else{
    res.send([]);
  }
});

app.put("/tasks",(req,res)=>{
  const { userId } = req.session;
  const { noteContent } = req.body;
  if(userId != null && noteContent != null){
    notes.push({
      uuid:crypto.randomBytes(20).toString('hex'),
      content:noteContent,
      userId:userId
    });
    return res.send({status:true})
  }else{
    return res.send({status:false})
  }
});

app.delete("/tasks",(req,res)=>{
  const { userId } = req.session;
  const { noteUuid } = req.body;
  if(userId != null && noteUuid != null){
    notes = notes.filter((item) => {
      return !(item.uuid === noteUuid && item.userId === userId);
    });
    return res.send({status:true})
  }else{
    return res.send({status:false})
  }
});

app.listen(PORT, () => console.log(
    `http://localhost:${PORT}`
))