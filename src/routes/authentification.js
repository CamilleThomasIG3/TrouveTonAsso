const express = require('express')
const router = express.Router()

const passport = require('passport')

router.get('/inscription', (req,res)=>{
  res.render('authentification/inscription')
})

router.post('/inscription', passport.authenticate('local.signup', {
  successRedirect: '/profil',
  failureRedirect: '/inscription',
  failureFlash: true
}))

router.get('/profil', (req, res) =>{
  res.send('Ton profil')
})

module.exports = router
