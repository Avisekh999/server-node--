const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const paymentRoute = require('./router/paymentRoute');
const connectDB = require('./config/db');
const brainRoute = require('./router/brainRoute');
const colors = require('colors')
const port = process.env.PORT || 5000


require('dotenv').config()
connectDB();

app.use(cors())
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send("apirunning")
})
app.use('/api',paymentRoute);
app.use('/api',brainRoute);


app.listen(port, ()=>{
  console.log(`App is running on port ${port}`);
});