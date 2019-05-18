const express = require('express')
const router = express.Router()

const pool = require('../database')
const helpers = require('../lib/helpers')
const { isAdmin, isGoodAsso } = require('../lib/auth')


//Display view "ajout_projet"
router.get('/ajout_projet/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params

  const pays = await pool.query('SELECT * FROM pays')
  
  res.render('projet/ajout_projet', { numSIREN_asso: numSIREN_asso, pays: pays})
})

//Recuperation datas from "ajout_projet"
router.post('/ajout_projet/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const { titre_projet, description_projet, date_debut_projet, date_fin_projet, nbre_participant_necessaire_projet,
  nbre_participant_actuel_projet, photo_projet, adresse_projet, arrondissement_projet, CP_projet, ville_projet, id_pays} = req.body

  res.redner('fait')
})

module.exports = router
