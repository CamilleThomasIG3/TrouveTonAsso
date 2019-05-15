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

//Display view "fiche" association
router.get('/fiche/:numSIREN_asso', isAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  res.render('association/fiche', {association: association[0]})
})

//Display view "modifier" association
router.get('/modifier/:numSIREN_asso', isAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  res.render('association/modifier', {association: association[0]})
})

//Recuperation datas from form "modifier association"
router.post('/modifier/:numSIREN_asso', isAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const { nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso, mdp_asso } = req.body
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

//Display view "membres" association
router.get('/membres/:numSIREN_asso', isAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  const membre = await pool.query('SELECT * FROM etre_membre WHERE numSIREN_asso=?', [numSIREN_asso])
  var i
  var personne = new Array()
  var poste, pers
  for (i = 0; i < membre.length; i++) {
    pers=await pool.query('SELECT * FROM personne WHERE id_personne=?', [membre[i].id_personne])
    personne[i]=pers[0]
    poste=await pool.query('SELECT * FROM poste WHERE id_poste=?', [membre[i].id_poste])
    personne[i].libelle_poste = poste[0].libelle_poste
    personne[i].numSIREN_asso = association[0].numSIREN_asso
  }
  res.render('association/membres', {association: association[0], personne: personne})
})

//Display view "modifier_membre"
router.get('/modifier_membre/:numSIREN_asso/:id_personne', isAdmin, async (req, res)=> {
  const { numSIREN_asso, id_personne } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  // const membre = await pool.query('SELECT * FROM etre_membre WHERE numSIREN_asso=? AND id_personne=?', [numSIREN_asso], [id_personne])
  // console.log(association[0])
  // res.render('association/modifier_membre', {association: association[0], membre: membre[0]})
  console.log('ici')

})

module.exports = router
