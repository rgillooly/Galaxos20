const { Signup, Login } = require('../controllers/AuthController')
const router = require('express').Router()
const { userVerification } = require("../middlewares/AuthMiddlewares")

router.post('/signup', Signup)
router.post('/Login', Login)
router.post('/',userVerification)

module.exports = router