const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const pool = require('../database')
const helpers = require('../lib/helpers')

//signin user
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
      done(null, personne, req.flash('success'))
    }else{
      done(null, false, req.flash('message', 'Mot de passe incorrecte'))
    }
  }else{
    return done(null, false, req.flash('message', "Cet email n'existe pas"))
  }
}))


//signin asso
passport.use('local.signinAsso', new LocalStrategy ({
  usernameField: 'email_asso',
  passwordField: 'mdp_asso',
  passReqToCallback: true
}, async (req, email_asso, mdp_asso, done)=>{
  const rows = await pool.query('SELECT * FROM association WHERE email_asso = ?', [email_asso])
  if(rows.length > 0){
    const association = rows[0]
    const validPassword = await helpers.matchPassword(mdp_asso, association.mdp_asso)
    if(validPassword){
      global.variable_globale = 1;
      done(null, association, req.flash('success'))
    }else{
      global.variable_globale = 0;
      done(null, false, req.flash('message', 'Mot de passe incorrecte'))
    }
  }else{
    global.variable_globale = 0;
    return done(null, false, req.flash('message', "Cet email d'association n'existe pas"))
  }
}))

//signup user
passport.use('local.signup', new LocalStrategy ({
  usernameField: 'email_personne',
  passwordField: 'mdp_personne',
  passReqToCallback: true
}, async (req, email_personne, mdp_personne, done) =>{
  const { prenom_personne, nom_personne, date_naissance_personne, adresse_personne, CP_personne, ville_personne, photo_personne } = req.body
  const newPersonne = {
    email_personne,
    mdp_personne,
    prenom_personne,
    nom_personne,
    date_naissance_personne,
    adresse_personne,
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

passport.serializeUser((association, done)=>{
  done(null, association.numSIREN_asso)
})

passport.deserializeUser(async (numSIREN_asso, done) => {
  const rows = await pool.query('SELECT * FROM association WHERE numSIREN_asso = ?', [numSIREN_asso])
  done(null, rows[0])
})
