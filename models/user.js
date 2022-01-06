const mongoose = require('mongoose')
const Schema = mongoose.Schema
const featureSchema = require('./feature')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: String,
    settings: {},
    points: [
        new Schema({
            geometry: {},
            type: { type: String },
            properties: {
                name: { type: String, required: true }
            }
        })
    ],
    routes: [],
    friends: [],

})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User