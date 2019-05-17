const pool = require('../database')


module.exports = {
  isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
      return next()
    }
    return res.redirect('/connexion')
  },

  isNotLoggedIn(req, res, next){
    if(!req.isAuthenticated()){
      return next()
    }
    return res.redirect('/profil')
  },

  isAdmin(req, res, next) {
    if(global.variable_globale === 1){
      return next()
    }
    return res.redirect('/connexion_association')
  },

  isNotAdmin(req, res, next) {
    if(global.variable_globale === 0){
      return next()
    }
    return res.redirect('/connexion')
  },

  isSuperAdmin(req, res, next) {
    if(global.variable_globale === 2){
      return next()
    }
    return res.redirect('/administrateur/connexion')
  },

  isNotSuperAdmin(req, res, next) {
    if(global.variable_globale === 0){
      return next()
    }
    return res.redirect('/super_administrateur/')
  },
}
