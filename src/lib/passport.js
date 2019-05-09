const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const pool = require('../database')
const helpers = require('../lib/helpers')

passport.use('local.signin', new LocalStrategy ({
  usernameField: 'email_personne',
  passwordField: 'mdp_personne',
  passReqToCallback: true
}, async (req, email_personne, mdp_personne, done)=>{
  const rows = await pool.query('SELECT * FROM personne WHERE email_personne = ?', [email_personne])
  if(rows.length > 0){
    const personne = rows[0]
    const validPassword = await helpers.matchPassword(mdp_personne, personne.mdp_personne)
    if(validPassword){
      done(null, personne, req.flash('success', 'Bienvenue ' + personne.prenom_personne))
    }else{
      done(null, false, req.flash('message', 'Mot de passe incorrecte'))
    }
  }else{
    return done(null, false, req.flash('message', "Cet email n'existe pas"))
  }
}))

passport.use('local.signup', new LocalStrategy ({
  usernameField: 'email_personne',
  passwordField: 'mdp_personne',
  passReqToCallback: true
}, async (req, email_personne, mdp_personne, done) =>{
  const { prenom_personne, nom_personne, date_naissance_personne, adresse_personne, arrondissement_personne, CP_personne, ville_personne, photo_personne } = req.body
  const newPersonne = {
    email_personne,
    mdp_personne,
    prenom_personne,
    nom_personne,
    date_naissance_personne,
    adresse_personne,
    arrondissement_personne,
    CP_personne,
    ville_personne,
    photo_personne
  }
  newPersonne.mdp_personne = await helpers.encryptPassword(mdp_personne)
  const result = await pool.query('INSERT INTO personne SET ?', [newPersonne])
  newPersonne.id_personne = result.insertId
  return done(null, newPersonne)
}))


passport.serializeUser((personne, done)=>{
  done(null, personne.id_personne)
})

passport.deserializeUser(async (id_personne, done) => {
  const rows = await pool.query('SELECT * FROM personne WHERE id_personne = ?', [id_personne])
  done(null, rows[0])
})
