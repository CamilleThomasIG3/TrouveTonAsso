const express = require('express')
const router = express.Router()
const pool = require('../database')
const helpers = require('../lib/helpers')

const passport = require('passport')
const { isLoggedIn, isNotLoggedIn, isSuperAdmin } = require('../lib/auth')

//connexion association
router.get('/', isSuperAdmin, async (req, res) => {
  const association = await pool.query('SELECT * FROM association')
  res.render('super_admin/index', {association})
})

//connexion association
router.get('/connexion', (req, res) => {
  res.render('super_admin/connexion')
})

router.post('/connexion', async (req, res, next)=>{
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


//Display view "fiche association"
router.get('/fiche/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  //Recuperation action countries
  const agir_pays = await pool.query('SELECT * FROM agir_pays WHERE numSIREN_asso=?', [numSIREN_asso])
  var i, id
  var pays_action = new Array()

  for (i = 0; i < agir_pays.length; i++) {
    id = await pool.query('SELECT * FROM pays WHERE id_pays=?', [agir_pays[i].id_pays])
    pays_action[i] = id[0]
  }

  //Recuperation asso types
  const type_asso = await pool.query('SELECT * FROM asso_de_type WHERE numSIREN_asso=?', [numSIREN_asso])
  var type_association = new Array()

  for (i = 0; i < type_asso.length; i++) {
    id = await pool.query('SELECT * FROM type_association WHERE id_type_asso=?', [type_asso[i].id_type_asso])
    type_association[i] = id[0]
  }

  res.render('association/fiche', {association: association[0], pays: pays_action,type: type_association})
})

//Display view "modifier" association
router.get('/modifier/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  res.render('association/modifier', {association: association[0]})
})

//Recuperation datas from form "modifier association"
router.post('/modifier/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  var { nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso, mdp_asso } = req.body

   if ( arrondissement_asso === ""){
     arrondissement_asso = null
   }
   if (facebook_asso === ""){
     facebook_asso = null
   }
   if (site_asso === ""){
     site_asso = null
   }
   if (tel_asso === ""){
     tel_asso = null
   }

  const newAssociation = {
    nom_asso,
    description_asso,
    adresse_asso,
    arrondissement_asso,
    CP_asso,
    ville_asso,
    email_asso,
    tel_asso,
    facebook_asso,
    site_asso,
    logo_asso,
    mdp_asso
  }
  newAssociation.mdp_asso = await helpers.encryptPassword(mdp_asso)
  await pool.query('UPDATE association set ? WHERE numSIREN_asso = ?', [newAssociation, numSIREN_asso])
  req.flash('success', 'Association modifiée avec succès')
  res.redirect('../fiche/'+numSIREN_asso)
})


//Display view "ajout association"
router.get('/ajout', isSuperAdmin, (req, res)=> {
  res.render('association/ajout')
})

//Recuperation datas from form "ajout association"
router.post('/ajout', isSuperAdmin, async (req, res)=> {
  var { numSIREN_asso, nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso, mdp_asso } = req.body


  if ( numSIREN_asso.length !== 9){
    req.flash('message', 'Numéro SIREN invalide')
    res.redirect('../super_administrateur/ajout')
  }
  else {
    if ( arrondissement_asso === ""){
      arrondissement_asso = null
    }
    if (facebook_asso === ""){
      facebook_asso = null
    }
    if (site_asso === ""){
      site_asso = null
    }
    if (tel_asso === ""){
      tel_asso = null
    }

    const newAssociation = {
      numSIREN_asso,
      nom_asso,
      description_asso,
      adresse_asso,
      arrondissement_asso,
      CP_asso,
      ville_asso,
      email_asso,
      tel_asso,
      facebook_asso,
      site_asso,
      logo_asso,
      mdp_asso
    }
    newAssociation.mdp_asso = await helpers.encryptPassword(mdp_asso)
    await pool.query('INSERT INTO association set ?', [newAssociation])
    req.flash('success', 'Association créée avec succès')
    res.redirect('../super_administrateur/')
  }
})


//Delete association
router.get('/supprimer/:numSIREN_asso', isSuperAdmin, async (req, res) =>{
  const { numSIREN_asso } = req.params
  await pool.query('DELETE FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  req.flash('success', 'Association supprimée avec succès')
  res.redirect('/super_administrateur/')
})

module.exports = router
