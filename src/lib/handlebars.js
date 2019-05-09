//Convertion clock
const { format } = require('timeago.js')

const helpers = {}

helpers.timeago = (timestamp) =>{
  return format(timestamp, 'fr_FR')
}

module.exports = helpers
