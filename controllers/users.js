const bcrypt = require('bcrypt')
require('express-async-errors')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async(request, response) => {
    const users = await User.find({})
    response.json(users.map(u => u.toJSON()))
})


usersRouter.get('/me', async(request, response) => {

    const user = await User.findById(request.user)
    response.json(request.user)
})

usersRouter.patch('/me', async(request, response) => {

    const user = await User.findById(request.user)
    if (!user) {
        response.status(401).json({ error: 'user not found in DB' })
    }

    const userId = user.id.toString()
        //console.log(JSON.parse(request.body))

    if (request.user) {
        const res = await User.findByIdAndUpdate(request.user, request.body, { new: true })
        response.status(200).json(res)
    } else {
        response.status(401).json({ error: 'invalid user' })
    }

    //response.json(request.user)
})


usersRouter.post('/', async(request, response) => {
    const body = request.body

    if (!body.password || body.password.length < 3) {
        response.status(400).json({ 'error': 'password missing or less than 3 characters long' }).end()
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash: passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
})

module.exports = usersRouter