const logger = require('./logger')
const jwt = require("jsonwebtoken")

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint."})
}

const errorHandler = (error, req, res, next) =>{
    logger.error(error.message)

    if( error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return res.status(400).json({error: 'expected `username` to be unique.'})
    } else if (error.name === 'ValidationError' && error.message.includes('is shorter than the minimum allowed length')){
        return res.status(400).json({error: 'expected `username` to be at least 3 characters.'})
    } else if (error.name === 'ValidationError' && error.message.includes('Path `username` is required')){
        return res.status(400).json({error: 'Username is required.'})
    } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({error: 'token invalid'})
    } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({error: 'token expired'})
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

const userExtractor = (req, res, next) => {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if(!decodedToken.id) {
        return res.status(401).json({error: "invalid token"})
    }
    
    req.user = decodedToken.id

    next()
}

module.exports = {
    unknownEndpoint, 
    errorHandler,
    tokenExtractor,
    userExtractor
}