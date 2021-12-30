const logger = require('./logger')
const jwt = require('jsonwebtoken')


const passwordhider = (body) => {
    let newBody = {...body }
    if ('password' in newBody) {
        newBody.password = '***'
    }
    return newBody

}

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', passwordhider(request.body))
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


const tokenExtractor = (request, response, next) => {


    if (request.get('authorization')) {

        const authorization = request.get('authorization')

        if (!(authorization.toLowerCase().startsWith('bearer'))) {

            return response.status(401).json({ error: 'invalid token' })

        }
        request.token = authorization.substring(7)
    }


    next()

}


const userExtractor = async(request, response, next) => {


    if (request.token) {
        const token = request.token


        if (!token) {

            return response.status(401).json({ error: 'missing token' })
        }

        let decodedT = null
        decodedT = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedT.id || !decodedT) {

            return response.status(401).json({ error: 'invalid token' })
        }


        request.user = decodedT.id.toString()


    }
    next()
}

const errorHandler = (error, request, response, next) => {

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'invalid access token' })
    }

    logger.error(error.message)

    next(error)
}



module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor

}