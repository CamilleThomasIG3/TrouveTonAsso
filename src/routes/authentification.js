const express = require('express')
const router = express.Router()

const passport = require('passport')
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth')

router.get('/inscription', isNotLoggedIn, (req,res)=>{
  res.render('authentification/inscription')
})

router.post('/inscription', isNotLoggedIn, passport.authenticate('local.signup', {
  successRedirect: '/profil',
  failureRedirect: '/inscription',
  failureFlash: true
}))

router.get('/connexion', isNotLoggedIn, (req, res) => {
  res.render('authentification/connexion')
})

router.post('/connexion', isNotLoggedIn, (req, res, next)=>{
  passport.authenticate('local.signin', {
    successRedirect: '/profil',
    failureRedirect: '/connexion',
    failureFlash: true
  })(req, res, next)
})

router.get('/profil', isLoggedIn, (req, res) =>{
  res.render('profil')
})

router.get('/deconnexion', (req, res) =>{
  req.logOut()
  res.redirect('/connexion')
})


module.exports = router
