const express = require('express')
const router = express.Router()
const dateFormat = require('dateformat')
const methodOverride = require('method-override')
router.use(methodOverride('_method'))

const pool = require('../database')
const helpers = require('../lib/helpers')
const { isAdmin, isGoodAsso } = require('../lib/auth')

//Display view "ajout_projet"
router.get('/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params

  const projets = await pool.query('SELECT * FROM projet WHERE numSIREN_asso=?', [numSIREN_asso])

  //for project search criteria
  const associations = await pool.query('SELECT * FROM association')

  res.render('projet/liste_projet', { numSIREN_asso: numSIREN_asso, projets: projets, associations})
})

//Display view "fiche_projet"
router.get('/fiche_projet/:numSIREN_asso/:id_projet', async (req, res)=> {
  const { numSIREN_asso, id_projet } = req.params

  var projet = await pool.query('SELECT * FROM projet WHERE id_projet=?', [id_projet])
  const pays = await pool.query('SELECT * FROM pays WHERE id_pays=?', [projet[0].id_pays])
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  const nb = projet[0].nbre_participant_necessaire_projet - projet[0].nbre_participant_actuel_projet

  projet[0].date_fin_projet = dateFormat(projet[0].date_fin_projet, 'dd/mm/yyyy')
  projet[0].date_debut_projet = dateFormat(projet[0].date_debut_projet, 'dd/mm/yyyy')

  res.render('projet/fiche_projet', { numSIREN_asso, projet: projet[0], pays: pays[0].nom_pays, nb, association: association[0] })
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

//Display project search
router.post('/recherche', async (req, res) =>{
  var {recherche} = req.body
  const projet_recherche = await pool.query("SELECT * FROM projet WHERE lower(titre_projet) LIKE lower('%"+recherche+"%')")

  //for project search criteria - only associations which did projects
  const projet_asso = await pool.query('SELECT DISTINCT numSIREN_asso FROM projet')
  var associations = []
  var tmp
  for (var i = 0; i < projet_asso.length; i++) {
    tmp = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [parseInt(projet_asso[i].numSIREN_asso)])
    associations[i]=tmp[0]
  }

  res.render('projet/recherche', {projet_recherche, recherche, associations})
})

//Display project search
router.post('/criteres', async (req, res) =>{
  const criteres = req.body

  if(criteres === undefined){
    req.flash('message',"Vous n'avez coché aucune association")
    res.redirect('/liste_projet')
  }
  else{
    var array = Object.keys(criteres)

    var projet_recherche = []
    var recherche = []
    var tmp
    var cmp = 0
    for (var i = 0; i < array.length; i++) {
      recherche = await pool.query('SELECT * FROM projet WHERE numSIREN_asso=?', [parseInt(array[i])])
      for (var j = 0; j < recherche.length; j++) {
        tmp = await pool.query('SELECT * FROM projet WHERE id_projet=?', [parseInt(recherche[j].id_projet)])
        projet_recherche[cmp]=tmp[0]
        cmp+=1
      }
    }

    //for project search criteria - only associations which did projects
    const projet_asso = await pool.query('SELECT DISTINCT numSIREN_asso FROM projet')
    var associations = []
    var tmp
    for (var i = 0; i < projet_asso.length; i++) {
      tmp = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [parseInt(projet_asso[i].numSIREN_asso)])
      associations[i]=tmp[0]
    }

    res.render('projet/recherche', { associations, projet_recherche})
  }
})


//Delete project
router.delete('/supprimer_projet/:numSIREN_asso/:id_projet', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso, id_projet } = req.params
  await pool.query('DELETE FROM projet WHERE numSIREN_asso=? AND id_projet=?', [numSIREN_asso, id_projet])
  req.flash('success', "Projet supprimé avec succès")
  res.redirect('/projet/'+numSIREN_asso)
})

module.exports = router
