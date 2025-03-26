const logger = require('./logger')

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint."})
}

const errorHandler = (error, req, res, next) =>{
    logger.error(error.message)

    if( error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return res.status(400).json({error: 'expected `username` to be unique.'})
    } else if (error.name === 'ValidationError' && error.message.includes('is shorter than the minimum allowed length')){
        return res.status(400).json({error: 'expected `username` to be at least 3 charakters.'})
    } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({error: 'token invalid'})
    }

    next(error)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '')
  } else{
      req.token = null
  }

  next()
}

module.exports = {
    unknownEndpoint, 
    errorHandler,
    tokenExtractor
}