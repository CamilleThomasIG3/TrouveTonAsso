const express = require('express')
const router = express.Router()

const pool = require('../database')
const helpers = require('../lib/helpers')
const { isLoggedIn, isAdmin} = require('../lib/auth')

//Display view "index_admin"
router.get('/:numSIREN_asso', isAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  res.render('admin/index_admin', {association: association[0]})
})

module.exports = router
