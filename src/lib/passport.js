const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const pool = require('../database')
const helpers = require('../lib/helpers')


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
  // newPersonne.id_personne = result.insertId
  // console.log(newPersonne.id_personne)
  console.log(result)
  // return done(null, newPersonne)
}))
//
// passport.serializeUser((user, done)=>{
//   done(null, user.id)
//   console.log('serializeUser')
// })
//
// passport.deserializeUser(async (id, done)=>{
//   const rows = pool.query('SELECT * FROM personne WHERE id_personne = ?', [id])
//   done(null, rows[0])
//   console.log('deserializeUser')
// })
