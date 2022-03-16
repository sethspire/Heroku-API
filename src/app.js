const express = require('express')
require('./db/mongoose')
const cors = require('cors');
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()

app.use(express.json())
app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(userRouter)
app.use(taskRouter)

const port = process.env.PORT

app.listen(port, () => {
    console.log('API service is up on port ' + port)
})