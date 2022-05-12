const jwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')

module.exports = jwt({
  secret: PRIVATE_KEY,
  credentialsRequired: false
}).unless({
  path: [
    '/',
    '/user/login'
  ]
})
