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


//Display view "fiche" association
router.get('/fiche/:numSIREN_asso', async (req, res)=> {
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

module.exports = router
