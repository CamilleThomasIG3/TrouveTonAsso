const express = require('express')
const router = express.Router()

const pool = require('../database')
const helpers = require('../lib/helpers')
const { isLoggedIn } = require('../lib/auth')

//Display view "index_admin"
router.get('/', isLoggedIn, (req, res)=> {
  res.render('admin/index_admin')
})

module.exports = router
