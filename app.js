require('dotenv').config()

const serverless = require('serverless-http');
const express = require('express')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const path = require('path')
const mapstyle = require('./stylejson/backgroundmap.json')
const custommap = require('./stylejson/maastokarttaCustom.json')

logger.info('connecting to', process.env.MONGODB_URI)


mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        logger.info('Connected to MongoDb')
    })
    .catch((error) => {
        logger.error('error connecting:', error.message)
    })


const app = express()
const options = {
    isBase64Encoded: true,
    setHeaders: function(res, path, stat) {
        res.set('Content-Type', 'image/png')
    }
}

app.use(express.static('images', options))
app.use(express.urlencoded({ extended: true }));

//app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.status(200).json({ health: 'ok' })
})

app.get('/api/mapstyle', (req, res) => {
    res.status(200).json(custommap)
})


app.get('/gpdr', (req, res) => {
    res.sendFile('./gpdrPage.html', { root: __dirname })
})

app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)

app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

if (process.env.CLOUD === 'local') {
    const port = process.env.PORT ? process.env.PORT : 3000
    app.listen(port)
}

console.log(`Server running on port ${process.env.PORT}`)
module.exports.handler = serverless(app);