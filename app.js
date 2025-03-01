const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const authenticate = require('./condition/condition');
const session = require('express-session');

dotenv.config();

mongoose.connect("mongodb://127.0.0.1:27017/shop", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Database connected")).catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", 'ejs'); 
app.use(express.static(path.join(__dirname, 'public')));

const userRoutes = require('./routes/user_routes');
  
   
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,  
    cookie: { secure: false } // Use true if using HTTPS
})); 

app.use('/', userRoutes);
app.use(authenticate.authenticate);


app.listen(8000, () => console.log("Server running on port 8000"));
