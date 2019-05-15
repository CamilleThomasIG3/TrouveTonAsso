const express = require('express')
const router = express.Router()
const pool = require('../database')
const helpers = require('../lib/helpers')

const passport = require('passport')
const { isNotLoggedIn, isSuperAdmin } = require('../lib/auth')

//connexion association
router.get('/', isSuperAdmin, (req, res) => {
  res.render('super_admin/index')
})

//connexion association
router.get('/connexion', isNotLoggedIn, (req, res) => {
  res.render('super_admin/connexion')
})

router.post('/connexion', isNotLoggedIn, async (req, res, next)=>{
  const email_super_admin = req.body.email_super_admin
  const super_admin= await pool.query('SELECT * FROM super_admin WHERE email_super_admin=?', [email_super_admin])
  var id_super_admin = 0;
  if(super_admin[0] != undefined){
    id_super_admin = super_admin[0].id_super_admin
  }
  passport.authenticate('local.signinSupAdmin', {
      successRedirect: '/super_administrateur/',
      failureRedirect: '/super_administrateur/connexion',
      failureFlash: true
    })(req, res, next)
})

module.exports = router
