const express = require('express')
const router = express.Router()

const pool = require('../database')
const helpers = require('../lib/helpers')
const { isLoggedIn, isAdmin, isGoodAsso} = require('../lib/auth')



//Display view "fiche" association
router.get('/:numSIREN_asso', isGoodAsso, async (req, res)=> {
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
router.get('/modifier/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  res.render('association/modifier', {association: association[0]})
})

//Recuperation datas from form "modifier association"
router.post('/modifier/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  var { nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso, mdp_asso, mdp_asso2 } = req.body

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

   if (mdp_asso !== mdp_asso2){
     req.flash('message', 'La confirmation de mot de passe ne correspond pas à votre mot de passe')
     res.redirect('./'+numSIREN_asso)
   }else {
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
     res.redirect('../'+numSIREN_asso)
   }
})

//Display view "membres" association
router.get('/membres/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
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
router.get('/modifier_membre/:numSIREN_asso/:id_personne', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso, id_personne } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  const membre = await pool.query('SELECT * FROM etre_membre WHERE numSIREN_asso=? AND id_personne=?', [numSIREN_asso, id_personne])
  const personne = await pool.query('SELECT * FROM personne WHERE id_personne=?', [id_personne])
  const poste_membre = await pool.query('SELECT * FROM poste WHERE id_poste=?', [membre[0].id_poste])
  personne[0].poste = poste_membre[0].libelle_poste
  const poste = await pool.query('SELECT * FROM poste WHERE id_poste != ?', [membre[0].id_poste])
  res.render('association/modifier_membre', {association: association[0], personne: personne[0], poste: poste})
})

//Recuperation "modifier_membre"
router.post('/modifier_membre/:numSIREN_asso/:id_personne', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso, id_personne } = req.params
  const { libelle_poste } = req.body
  const poste_membre = await pool.query('SELECT * FROM poste WHERE libelle_poste=?', [libelle_poste])
  const id_poste = poste_membre[0].id_poste

  await pool.query('UPDATE etre_membre set id_poste=? WHERE numSIREN_asso = ? AND id_personne=?', [id_poste, numSIREN_asso, id_personne])
  req.flash('success', 'Membre modifié avec succès')
  res.redirect('/association/membres/'+numSIREN_asso)
})

//Display view "ajouter_membre"
router.get('/ajouter_membre/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  const poste = await pool.query('SELECT * FROM poste')
  res.render('association/ajouter_membre', {association: association[0], poste: poste})
})

//Recuperation "ajouter_membre"
router.post('/ajouter_membre/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const { email_personne, libelle_poste } = req.body


  const personne = await pool.query('SELECT * FROM personne WHERE email_personne=?', [email_personne])
  if (personne[0] === undefined){//person doesnt exist
    req.flash('message', "Cet email n'existe pas")
    res.redirect('/association/ajouter_membre/'+numSIREN_asso)
  }
  else{//person exists in asso already
    const id_personne = personne[0].id_personne
    const est_membre = await pool.query('SELECT * FROM etre_membre WHERE id_personne=? AND numSIREN_asso=?', [id_personne, numSIREN_asso])
    if (est_membre[0] !== undefined){//person in asso already
      req.flash('message', "Ce membre fait déjà partie de votre association")
      res.redirect('/association/membres/'+numSIREN_asso)
    }
    else{ //person exists and not in asso yet
      const poste_membre = await pool.query('SELECT * FROM poste WHERE libelle_poste=?', [libelle_poste])
      const id_poste = poste_membre[0].id_poste
      await pool.query('INSERT INTO etre_membre VALUES (?, ?, ?);', [id_personne, numSIREN_asso, id_poste])
      req.flash('success', 'Membre ajouté avec succès')
      res.redirect('/association/membres/'+numSIREN_asso)
    }
  }
})

//Display view "ajouter_poste"
router.get('/ajout_poste/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  res.render('association/ajout_poste', {association: association[0]})
})

//Recuperation from view "ajouter_poste"
router.post('/ajout_poste/:numSIREN_asso', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso } = req.params
  const { libelle_poste } = req.body

  const poste = await pool.query('SELECT * FROM poste WHERE  upper(libelle_poste)=upper(?)', [libelle_poste])

  if(poste[0] === undefined){
    await pool.query('INSERT INTO poste VALUES (0,?)', [libelle_poste])
  }

  req.flash('success',"Poste ajouté avec succès")
  res.redirect('../ajouter_membre/'+numSIREN_asso)
})


//Delete membre
router.get('/supprimer_membre/:numSIREN_asso/:id_personne', isAdmin, isGoodAsso, async (req, res)=> {
  const { numSIREN_asso, id_personne } = req.params
  await pool.query('DELETE FROM etre_membre WHERE numSIREN_asso=? AND id_personne=?', [numSIREN_asso, id_personne])
  req.flash('success', "Membre supprimé avec succès")
  res.redirect('/association/membres/'+numSIREN_asso)
})

module.exports = router
