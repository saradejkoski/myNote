const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require("crypto");


const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
  PORT = 3000,
  NODE_ENV = 'development',

  SESS_NAME = 'sid',
  SESS_SECRET = 'ssh!quiet,it\'asecret!',
    //allows express-session to use it to encrypt the session id
  SEES_LIFETIME = TWO_HOURS
    //maximum time of an end user sign on session
} = process.env;

const IN_PROD = NODE_ENV === 'production';
// ensures that loggin is kept to a minimum, optimizing performance

const users = [
  { id: 1, email: 'alex@gmail.com', password: 'secret' },
  { id: 2, email: 'max@gmail.com', password: 'secret' },
  { id: 3, email: 'tom@gmail.com', password: 'secret' }
];

let notes = [{
  userId:2,
  uuid:"smldfkjalsdkjfalskdjfalkdsf",
  content:"Homework"
}];

// Needed for login.
const app = express();

// Body to Json
app.use(bodyParser.json());

app.use(session({
  name: SESS_NAME,
  resave: false,
  saveUninitialized: false,
  //forces a session to be saved back, --> false so that it does not be saved
  secret: SESS_SECRET,
  cookie: {
    maxAge: SEES_LIFETIME,
    //sets time for when a cookie will be deleted
    sameSite: true,
    //helps browsers to identify whether a cookie is allowed to be accessed or not
    secure: IN_PROD
    // sets secure also to true, cookies are accepted if they are from the same origin
  }
}));

// Building the path.
app.use("/", express.static(__dirname + '/public'));


// req.session to access data in session or to leave it there, local user gets an ID
app.use((req, res, next) => {
  const { userId } = req.session;
  if (userId) {
    res.locals.user = users.find(
        user => user.id === userId);
  }
  next();
});

// Request Session, if there is a user ID Information will be sent.
app.get("/getProfile",(req,res)=>{
  const { userId } = req.session;
  if(userId != null){
    res.send(true);
  }else{
    res.send(false);
  }
});

// Looks for main.html
app.get("/main",(req,res) => {
  res.sendFile(__dirname + "/public/main.html");
});

app.get('/',  (req, res) => {
  res.sendFile(__dirname + "/public/main.html");
});

// Requests email and password at Login.
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (email && password) {

    // User email and written email and user password and written password are getting compared.
    const user = users.find(
        user => user.email === email && user.password === password);
    if (user) {
      // if User exists body will be sent.
      req.session.userId = user.id;
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
    );
    // if the email does not exist, a new user is created an id is incremented by 1.
    if (!exists) {
      const user = {
        id: users.length + 1,
        email,
        password
      };

      // pushes the new user with its parameters to our users Array.
      users.push(user);
      req.session.userId = user.id;

      return res.send({status:true});
    }
  }
  return res.send({status:false});
});

// Session gets destroyed -> Logout
app.delete('/session', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      // redirects to main.html
      return res.redirect('/');
    }
    // clear Cookies for completely deleting the Session.
    res.clearCookie(SESS_NAME);
    res.send("ok");
  });
});


// Method for saving the Notes to a particular User.
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

// Creates uuid (universal unique id)-> every task gets its uuid for identification. Then gets pushed to Notes Array.
app.put("/tasks",(req,res)=>{
  const { userId } = req.session;
  const { noteContent } = req.body;
  if(userId != null && noteContent != null){
    notes.push({
      uuid:crypto.randomBytes(20).toString('hex'),
      content:noteContent,
      userId:userId
    });
    return res.send({status:true});
  }else{
    return res.send({status:false});
  }
});

/*
 Request session and body. Looks if there is a user ID and valid Note.
 -> filters the notes while looking for the particular Note which is meant to be deleted
 -> Note gets deleted.
 */
app.delete("/tasks",(req,res)=>{
  const { userId } = req.session;
  const { noteUuid } = req.body;
  if(userId != null && noteUuid != null){
    notes = notes.filter((item) => {
      return (item.uuid === noteUuid && item.userId === userId);
    });
    return res.send({status:true});
  }else{
    return res.send({status:false});
  }
});

app.listen(PORT, () => console.log(
    `http://localhost:${PORT}`
));