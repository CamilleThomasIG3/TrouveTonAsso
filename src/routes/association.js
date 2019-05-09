const express = require('express')
const router = express.Router()
const pool = require('../database')

//Display view "ajout association"
router.get('/ajout', (req, res)=> {
  res.render('association/ajout')
})

//Recuperation datas from form "ajout association"
router.post('/ajout', async (req, res)=> {
  const { numSIREN_asso, nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso } = req.body
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
    logo_asso
  }
  await pool.query('INSERT INTO association set ?', [newAssociation])
  req.flash('success', 'Association sauvegardée avec succès')
  res.redirect('/association')
})

//Display view "liste association"
router.get('/', async (req, res) =>{
  const association = await pool.query('SELECT * FROM association')
  res.render('association/liste', {association})
})

//Delete association
router.get('/supprimer/:numSIREN_asso', async (req, res) =>{
  const { numSIREN_asso } = req.params
  await pool.query('DELETE FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  req.flash('success', 'Association supprimée avec succès')
  res.redirect('/association')
})

//Edit association
router.get('/modifier/:numSIREN_asso', async (req, res) =>{
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  res.render('association/modifier', {association: association[0]})
})

//Recuperation datas from form "modifier association"
router.post('/modifier/:numSIREN_asso', async (req, res)=> {
  const { numSIREN_asso } = req.params
  const { nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso } = req.body
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
    logo_asso
  }
  await pool.query('UPDATE association set ? WHERE numSIREN_asso = ?', [newAssociation, numSIREN_asso])
  req.flash('success', 'Association modifiée avec succès')
  res.redirect('/association')
})

module.exports = router
