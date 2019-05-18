const express = require('express')
const router = express.Router()
const dateFormat = require('dateformat')

const pool = require('../database')
const helpers = require('../lib/helpers')
const { isAdmin, isGoodAsso } = require('../lib/auth')

//Display view "ajout_projet"
router.get('/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params

  const projets = await pool.query('SELECT * FROM projet WHERE numSIREN_asso=?', [numSIREN_asso])

  res.render('projet/liste_projet', { numSIREN_asso: numSIREN_asso, projets: projets})
})

//Display view "fiche_projet"
router.get('/fiche_projet/:numSIREN_asso/:id_projet', async (req, res)=> {
  const { numSIREN_asso, id_projet } = req.params

  var projet = await pool.query('SELECT * FROM projet WHERE id_projet=?', [id_projet])
  const pays = await pool.query('SELECT * FROM pays WHERE id_pays=?', [projet[0].id_pays])

  const nb = projet[0].nbre_participant_necessaire_projet - projet[0].nbre_participant_actuel_projet

  projet[0].date_fin_projet = dateFormat(projet[0].date_fin_projet, 'dd/mm/yyyy')
  projet[0].date_debut_projet = dateFormat(projet[0].date_debut_projet, 'dd/mm/yyyy')

  res.render('projet/fiche_projet', { numSIREN_asso, projet: projet[0], pays: pays[0].nom_pays, nb})
})

//Display view "ajout_projet"
router.get('/ajout_projet/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params

  const pays = await pool.query('SELECT * FROM pays')

  res.render('projet/ajout_projet', { numSIREN_asso: numSIREN_asso, pays: pays})
})

//Recuperation datas from "ajout_projet"
router.post('/ajout_projet/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  var { titre_projet, description_projet, date_debut_projet, date_fin_projet, nbre_participant_necessaire_projet,
  nbre_participant_actuel_projet, photo_projet, adresse_projet, arrondissement_projet, CP_projet, ville_projet, id_pays} = req.body

  if(adresse_projet === ""){
    adresse_projet = null
  }
  if(arrondissement_projet === ""){
    arrondissement_projet = null
  }
  if(CP_projet === ""){
    CP_projet = null
  }

  photo_projet = "/images/projets/"+photo_projet

  const newProjet = {
    titre_projet,
    description_projet,
    date_debut_projet,
    date_fin_projet,
    nbre_participant_necessaire_projet,
    nbre_participant_actuel_projet,
    photo_projet,
    adresse_projet,
    arrondissement_projet,
    CP_projet,
    ville_projet,
    numSIREN_asso,
    id_pays
  }

  await pool.query('INSERT INTO projet set ?', [newProjet])

  req.flash('success', 'Projet créé avec succès')
  res.redirect('../'+numSIREN_asso)
})


//Display view "modifier_projet"
router.get('/modifier_projet/:numSIREN_asso/:id_projet', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso, id_projet } = req.params

  var projet = await pool.query('SELECT * FROM projet WHERE id_projet=?', [id_projet])
  const pays = await pool.query('SELECT * FROM pays WHERE id_pays=?', [projet[0].id_pays])
  const autrePays = await pool.query('SELECT * FROM pays WHERE id_pays!=?', [projet[0].id_pays])

  projet[0].date_fin_projet = dateFormat(projet[0].date_fin_projet, 'dd/mm/yyyy')
  projet[0].date_debut_projet = dateFormat(projet[0].date_debut_projet, 'dd/mm/yyyy')
  projet[0].photo_projet = projet[0].photo_projet.substring(16,)

  res.render('projet/modifier_projet', {projet: projet[0], pays: pays[0], autrePays})
})


//Recuperation datas from "ajout_projet"
router.post('/modifier_projet/:numSIREN_asso/:id_projet', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso, id_projet } = req.params
  var { titre_projet, description_projet, date_debut_projet, date_fin_projet, nbre_participant_necessaire_projet,
  nbre_participant_actuel_projet, photo_projet, adresse_projet, arrondissement_projet, CP_projet, ville_projet, id_pays} = req.body

  if(adresse_projet === ""){
    adresse_projet = null
  }
  if(arrondissement_projet === ""){
    arrondissement_projet = null
  }
  if(CP_projet === ""){
    CP_projet = null
  }

  photo_projet = "/images/projets/"+photo_projet

  var deb = date_debut_projet
  var fin = date_fin_projet

  var d = new Date()
  d.setDate(parseInt(deb.substring(0,2)))
  d.setMonth(parseInt(deb.substring(3,5))-1)
  d.setFullYear(parseInt(deb.substring(6,)))

  var f = new Date()
  f.setDate(parseInt(fin.substring(0,2)))
  f.setMonth(parseInt(fin.substring(3,5))-1)
  f.setFullYear(parseInt(fin.substring(6,)))

  date_debut_projet = d
  date_fin_projet = f

  const newProjet = {
    titre_projet,
    description_projet,
    date_debut_projet,
    date_fin_projet,
    nbre_participant_necessaire_projet,
    nbre_participant_actuel_projet,
    photo_projet,
    adresse_projet,
    arrondissement_projet,
    CP_projet,
    ville_projet,
    numSIREN_asso,
    id_pays
  }

  await pool.query('UPDATE projet set ? WHERE id_projet = ?', [newProjet, id_projet])

  req.flash('success', 'Projet modifié avec succès')
  res.redirect('/projet/'+numSIREN_asso)
})


//Delete project
router.get('/supprimer_projet/:numSIREN_asso/:id_projet', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso, id_projet } = req.params
  await pool.query('DELETE FROM projet WHERE numSIREN_asso=? AND id_projet=?', [numSIREN_asso, id_projet])
  req.flash('success', "Projet supprimé avec succès")
  res.redirect('/projet/'+numSIREN_asso)
})

module.exports = router
