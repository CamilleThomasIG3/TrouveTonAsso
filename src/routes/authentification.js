const express = require('express')
const router = express.Router()
const pool = require('../database')
const helpers = require('../lib/helpers')

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


// Connexion user
router.get('/connexion', isNotLoggedIn, (req, res) => {
  res.render('authentification/connexion')
})

router.post('/connexion', isNotLoggedIn, async (req, res, next)=>{
  passport.authenticate('local.signin', {
      successRedirect: '/profil',
      failureRedirect: '/connexion',
      failureFlash: true
    })(req, res, next)
})

router.get('/profil', isLoggedIn, (req, res) =>{
  res.render('authentification/profil')
})

router.get('/deconnexion', (req, res) =>{
  global.variable_globale = 0;
  req.logOut()
  res.redirect('/')
})


//Edit personne
router.get('/modifier/:id_personne', isLoggedIn, async (req, res) =>{
  const { id_personne } = req.params
  const personne = await pool.query('SELECT * FROM personne WHERE id_personne=?', [id_personne])
  res.render('authentification/modifier', {personne: personne[0]})
})

//Recuperation datas from form "modifier personne"
router.post('/modifier/:id_personne', isLoggedIn, async (req, res)=> {
  const { id_personne } = req.params
  const { prenom_personne, nom_personne, date_naissance_personne, adresse_personne,
     CP_personne, ville_personne, email_personne, mdp_personne, photo_personne } = req.body
  const newPersonne = {
    prenom_personne,
    nom_personne,
    date_naissance_personne,
    adresse_personne,
    CP_personne,
    ville_personne,
    email_personne,
    mdp_personne,
    photo_personne
  }
  newPersonne.mdp_personne = await helpers.encryptPassword(mdp_personne)
  await pool.query('UPDATE personne set ? WHERE id_personne = ?', [newPersonne, id_personne])
  req.flash('success', 'Profil modifié avec succès')
  res.redirect('/profil')
})


//connexion association
router.get('/connexion_association', isNotLoggedIn, (req, res) => {
  res.render('authentification/connexion_asso')
})

router.post('/connexion_association', isNotLoggedIn, async (req, res, next)=>{
  passport.authenticate('local.signinAsso', {
      successRedirect: '/administrateur/',
      failureRedirect: '/connexion_association',
      failureFlash: true
    })(req, res, next)
})

module.exports = router
