const express = require('express')
const router = express.Router()
const pool = require('../database')
const helpers = require('../lib/helpers')
const methodOverride = require('method-override')
router.use(methodOverride('_method'))

const passport = require('passport')
const { isLoggedIn, isNotLoggedIn, isSuperAdmin, isAdmin } = require('../lib/auth')

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
  var association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  association[0].logo_asso = association[0].logo_asso.substring(14, )

  res.render('association/modifier', {association: association[0]})
})

//Recuperation datas from form "modifier association"
router.post('/modifier/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const { numSIREN_asso } = req.params
  var { nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso } = req.body

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
  res.redirect('../fiche/'+numSIREN_asso)
})


//Display view "ajout association"
router.get('/ajout_association', isSuperAdmin, async (req, res)=> {
  res.render('association/ajout_association')
})

//Recuperation datas from form "ajout association"
router.post('/ajout_association', isSuperAdmin, async (req, res)=> {
  const tmp = req.body
  var {numSIREN_asso, nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso, mdp_asso, mdp_asso2 } = req.body

  if ( numSIREN_asso.length !== 9){
    req.flash('message', 'Numéro SIREN invalide')
    res.redirect('../super_administrateur/ajout_association')
  }
  else {
    const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
    if ( association[0] !== undefined){
      req.flash('message', 'Numéro SIREN non disponible')
      res.redirect('../super_administrateur/ajout_association')
    }
    const email = await pool.query('SELECT * FROM association WHERE email_asso=?', [email_asso])
    if ( email[0] !== undefined){
      req.flash('message', 'Email non disponible')
      res.redirect('../super_administrateur/ajout_association')
    }
    else{
      if (mdp_asso !== mdp_asso2) {
        req.flash('message', 'La confirmation de mot de passe ne correspond pas à votre mot de passe')
        res.redirect('../super_administrateur/ajout_association')
      }else {
        if (tel_asso.length !== 10 && tel_asso !== "") {
          req.flash('message', 'Le numéro de téléphone est non conforme')
          res.redirect('../super_administrateur/ajout_association')
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
          res.redirect('ajout_type_association/'+numSIREN_asso)
        }

      }
    }
  }
})

//Display view "ajout association"
router.get('/ajout_type_association/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const numSIREN_asso = req.params.numSIREN_asso
  const type_association = await pool.query('SELECT * FROM type_association')
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  res.render('association/ajout_type_association', {association: association[0], type_association: type_association})
})

//Recuperation datas from view "ajout type association"
router.post('/ajout_type_association/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const numSIREN_asso = req.params.numSIREN_asso
  var tmp = req.body

  //Fill "asso_de_type" table
  var array = Object.keys(tmp)
  var i
  for(i=0;i<Object.keys(tmp).length;i++ ){
    await pool.query('INSERT INTO asso_de_type VALUES ("?",?)', [parseInt(array[i]),numSIREN_asso])
  }

  const pays_action = await pool.query('SELECT * FROM pays')
  res.redirect('../ajout_pays_association/'+numSIREN_asso)
})


//Display view "ajout association"
router.get('/ajout_pays_association/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const numSIREN_asso = req.params.numSIREN_asso
  const pays_action = await pool.query('SELECT * FROM pays')
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  res.render('association/ajout_pays_association', {association: association[0], pays_action: pays_action})
})


//Recuperation from view "ajout pays action"
router.post('/ajout_pays_association/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
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



//Display view "ajouter_type"
router.get('/ajout_type/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const {numSIREN_asso} = req.params
  res.render('association/ajout_type', {numSIREN_asso: numSIREN_asso})
})

//Recuperation from view "ajouter_type"
router.post('/ajout_type/:numSIREN_asso', isSuperAdmin, async (req, res)=> {
  const {numSIREN_asso} = req.params
  var { libelle_type_asso, icone_type_asso } = req.body

  const type = await pool.query('SELECT * FROM type_association WHERE upper(libelle_type_asso)=upper(?)', [libelle_type_asso])

  if(type[0] === undefined){
    icone_type_asso = '/images/icones/'+icone_type_asso
    await pool.query('INSERT INTO type_association VALUES (0,?,?)', [libelle_type_asso, icone_type_asso])
  }

  req.flash('success',"Type d'association ajouté avec succès")
  res.redirect('../ajout_type_association/'+numSIREN_asso)
})


//Display view "ajouter_pays"
router.get('/ajout_pays/:numSIREN_asso', isAdmin, async (req, res)=> {
  const {numSIREN_asso} = req.params
  res.render('association/ajout_pays', {numSIREN_asso: numSIREN_asso})
})

//Recuperation from view "ajouter_type"
router.post('/ajout_pays/:numSIREN_asso', isAdmin, async (req, res)=> {
  const {numSIREN_asso} = req.params
  var { nom_pays } = req.body

  const pays = await pool.query('SELECT * FROM pays WHERE upper(nom_pays)=upper(?)', [nom_pays])

  if(pays[0] === undefined){
    await pool.query('INSERT INTO pays VALUES (0,?)', [nom_pays])
  }

  req.flash('success',"Pays ajouté avec succès")
  if(global.variable_globale === 2){
    res.redirect('../ajout_pays_association/'+numSIREN_asso)
  }
  res.redirect('/projet/ajout_projet/'+numSIREN_asso)
})



//Delete association
router.delete('/supprimer/:numSIREN_asso', isSuperAdmin, async (req, res) =>{
  const { numSIREN_asso } = req.params
  await pool.query('DELETE FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  req.flash('success', 'Association supprimée avec succès')
  res.redirect('/super_administrateur/')
})

module.exports = router
