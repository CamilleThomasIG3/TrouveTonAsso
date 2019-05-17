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
router.get('/ajout', isSuperAdmin, async (req, res)=> {
  res.render('association/ajout')
})

//Recuperation datas from form "ajout association"
router.post('/ajout', isSuperAdmin, async (req, res)=> {
  const tmp = req.body
  var {numSIREN_asso, nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso, mdp_asso } = req.body

  if ( numSIREN_asso.length !== 9){
    req.flash('message', 'Numéro SIREN invalide')
    res.redirect('../super_administrateur/ajout')
  }
  else {
    const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
    if ( association[0] !== undefined){
      req.flash('message', 'Numéro SIREN non disponible')
      res.redirect('../super_administrateur/ajout')
    }
    else{
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

      logo_asso = "/images/logos/"+logo_asso

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

      const type_association = await pool.query('SELECT * FROM type_association')
      res.redirect('ajout_type/'+numSIREN_asso)
    }
  }
})

//Display view "ajout association"
router.get('/ajout_type/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const numSIREN_asso = req.params.numSIREN_asso
  const type_association = await pool.query('SELECT * FROM type_association')
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  res.render('association/ajout_type', {association: association[0], type_association: type_association})
})

//Recuperation datas from view "ajout type association"
router.post('/ajout_type/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const numSIREN_asso = req.params.numSIREN_asso
  var tmp = req.body

  //Fill "asso_de_type" table
  var array = Object.keys(tmp)
  var i
  for(i=0;i<Object.keys(tmp).length;i++ ){
    await pool.query('INSERT INTO asso_de_type VALUES ("?",?)', [parseInt(array[i]),numSIREN_asso])
  }

  const pays_action = await pool.query('SELECT * FROM pays')
  res.redirect('../ajout_pays/'+numSIREN_asso)
})


//Display view "ajout association"
router.get('/ajout_pays/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const numSIREN_asso = req.params.numSIREN_asso
  const pays_action = await pool.query('SELECT * FROM pays')
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  res.render('association/ajout_pays', {association: association[0], pays_action: pays_action})
})


//Recuperation from view "ajout pays action"
router.post('/ajout_pays/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const numSIREN_asso = req.params.numSIREN_asso
  var tmp = req.body
  //Fill "agir_pays" table
  var array = Object.keys(tmp)

  var i
  for(i=0;i<Object.keys(tmp).length;i++ ){
    await pool.query('INSERT INTO agir_pays VALUES ("?",?)', [parseInt(array[i]),numSIREN_asso])
  }

  req.flash('success', "L'association a été créée avec succès")
  res.redirect('../')
})



//Delete association
router.get('/supprimer/:numSIREN_asso', isSuperAdmin, async (req, res) =>{
  const { numSIREN_asso } = req.params
  await pool.query('DELETE FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  req.flash('success', 'Association supprimée avec succès')
  res.redirect('/super_administrateur/')
})

module.exports = router
