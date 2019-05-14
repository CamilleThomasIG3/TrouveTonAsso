const express = require('express')
const router = express.Router()

const pool = require('../database')
const helpers = require('../lib/helpers')
const { isLoggedIn } = require('../lib/auth')

//Display view "ajout association"
router.get('/ajout', /*isLoggedIn,*/(req, res)=> {
  res.render('association/ajout')
})

//Recuperation datas from form "ajout association"
router.post('/ajout', /*isLoggedIn,*/ async (req, res)=> {
  const { numSIREN_asso, nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso, mdp_asso } = req.body
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
  req.flash('success', 'Association sauvegardée avec succès')
  res.redirect('../..')
})


//Delete association
router.delete('/supprimer/:numSIREN_asso', isLoggedIn, async (req, res) =>{
  const { numSIREN_asso } = req.params
  await pool.query('DELETE FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  req.flash('success', 'Association supprimée avec succès')
  res.redirect('../..')
})

module.exports = router
