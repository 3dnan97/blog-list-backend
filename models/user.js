const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        unique: true
    },
    name: String,
    passwordHash: String,
    blogs:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
})

userSchema.set('toJSON', {
    transform:(document, returnedObj) =>{
        returnedObj.id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
        console.log(returnedObj.passwordHash);
        
        delete returnedObj.passwordHash
    }
})

module.exports = mongoose.model('User',userSchema)