const express = require('express');
require('./db');
require('dotenv').config();

const cors = require('cors')

const userRouter = require('./routes/user');
const app = express();

const PORT = process.env.PORT || 8001;
app.use(cors());
app.use(express.json());
app.use('/api/user/', userRouter)

// app.use((req, res,next) => {
//     req.on('data', (chunk)=>{
//         req.body = JSON.parse(chunk)
//         next()
//     })
// })

// app.get('/', (req,res)=>{
//     res.send('hello')
// })

// app.post('/api/user/create', async (req, res,next) => {
    //   res.send(req.body)  
    


app.listen(PORT, () => {
    console.log(`app is running ${PORT}` );
});
