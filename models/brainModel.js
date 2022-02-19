const mongoose = require('mongoose');


const brainSchema = mongoose.Schema({
    brain:{
        type:Number,
        required:true,
        default:0  
    }

})


const Brain = mongoose.model('Brain', brainSchema);
module.exports = Brain;