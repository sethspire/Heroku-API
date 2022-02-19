const express = require('express')
const User = require('../models/user')
const account = require('../emails/account')
const auth = require('../middleware/auth')
const router = new express.Router()

// Add a new user and send email
router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()
    account.sendWelcomeEmail(user.email, user.name)
    res.status(201).send({user, token})
  } 
  catch(error) {
    res.status(400).send(error)
  }
})

// logs out user
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    
    res.send()
  }
  catch (e) {
    res.status(500).send()
  }
})

module.exports = router