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
  if(rows.length > 0){//person exists
    const personne = rows[0]
    const validPassword = await helpers.matchPassword(mdp_personne, personne.mdp_personne)
    if(validPassword){//password valid
      global.variable_globale = 0
      done(null, personne, req.flash('success'))
    }else{//password not valid
      global.variable_globale = 0
      done(null, false, req.flash('message', 'Mot de passe incorrecte'))
    }
  }else{//person doesnt exist
    global.variable_globale = 0
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
  if(rows.length > 0){//person exists
    const association = rows[0]
    const validPassword = await helpers.matchPassword(mdp_asso, association.mdp_asso)
    if(validPassword){//password valid
      global.variable_globale = 1
      done(null, association, req.flash('success'))
    }else{//password not valid
      global.variable_globale = 0
      done(null, false, req.flash('message', 'Mot de passe incorrecte'))
    }
  }else{//person doesnt lambda
    global.variable_globale = 0
    return done(null, false, req.flash('message', "Cet email d'association n'existe pas"))
  }
}))


//signin super admin
passport.use('local.signinSupAdmin', new LocalStrategy ({
  usernameField: 'email_super_admin',
  passwordField: 'mdp_super_admin',
  passReqToCallback: true
}, async (req, email_super_admin, mdp_super_admin, done)=>{
  const rows = await pool.query('SELECT * FROM super_admin WHERE email_super_admin = ?', [email_super_admin])
  if(rows.length > 0){//super admin email exists
    const super_admin = rows[0]
    const validPassword = await helpers.matchPassword(mdp_super_admin, super_admin.mdp_super_admin)
    if(validPassword){//password valid
      global.variable_globale = 2
      done(null, super_admin, req.flash('success'))
    }else{//password not valid
      global.variable_globale = 0
      done(null, false, req.flash('message', 'Mot de passe incorrecte'))
    }
  }
  else{//super admin email doesnt exist
    global.variable_globale = 0
    return done(null, false, req.flash('message', "Cet email n'est pas reconnue en tant que Super Administrateur"))
  }
}))


//signup user
passport.use('local.signup', new LocalStrategy ({
  usernameField: 'email_personne',
  passwordField: 'mdp_personne',
  passReqToCallback: true
}, async (req, email_personne, mdp_personne, done) =>{
  var { prenom_personne, nom_personne, date_naissance_personne, adresse_personne,
    CP_personne, ville_personne, photo_personne, mdp_personne2 } = req.body
console.log('la');
  if (photo_personne === ""){
    photo_personne = "anonyme.png"
  }
  photo_personne = "/images/profils/"+photo_personne
console.log('ici');
  const personne =  await pool.query('SELECT * FROM personne WHERE email_personne = ?', [email_personne])

  if (personne[0] !== undefined){ //email already exists
    console.log('here');
    done(null, false, req.flash('message', "Cet email n'est pas disponible"))
  }
  else{
    if(mdp_personne !== mdp_personne2){
      console.log('tre');
      done(null, false, req.flash('message', "La confirmation de mot de passe ne correspond pas à votre mot de passe"))
    }
    else {
      console.log('tut');
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
      console.log('rere');
      newPersonne.mdp_personne = await helpers.encryptPassword(mdp_personne)
      const result = await pool.query('INSERT INTO personne SET ?', [newPersonne])
      newPersonne.id_personne = result.insertId
      return done(null, newPersonne)
    }
  }
}))


//person
passport.serializeUser((personne, done)=>{
  done(null, personne.id_personne)
})

passport.deserializeUser(async (id_personne, done) => {
  const rows = await pool.query('SELECT * FROM personne WHERE id_personne = ?', [id_personne])
  done(null, rows[0])
})

//association
passport.serializeUser((association, done)=>{
  done(null, association.numSIREN_asso)
})

passport.deserializeUser(async (numSIREN_asso, done) => {
  const rows = await pool.query('SELECT * FROM association WHERE numSIREN_asso = ?', [numSIREN_asso])
  done(null, rows[0])
})

//super_admin
passport.serializeUser((super_admin, done)=>{
  done(null, super_admin.id_super_admin)
})

passport.deserializeUser(async (id_super_admin, done) => {
  const rows = await pool.query('SELECT * FROM super_admin WHERE id_super_admin = ?', [id_super_admin])
  done(null, rows[0])
})
