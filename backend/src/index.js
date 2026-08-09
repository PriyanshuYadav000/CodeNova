const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const cors = require('cors')

// console.log("Hello")

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CodeNova API is healthy'
    });
});

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);


const initializeConnection = async ()=>{
    try{

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


initializeConnection();
