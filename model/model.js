var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ApiSchema   = new Schema({
    type: String,
    id : String,
    value: String
    //isSpammed : Boolean
});

module.exports = mongoose.model('dataSaver', ApiSchema);