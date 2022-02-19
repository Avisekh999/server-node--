const express = require('express');
const router = express.Router();
const Brain = require('../models/brainModel')


router.post('/brain',async(req,res)=> {
    const {brainNo} = req.body;
    console.log(brainNo)

    const brain = await Brain.create({
        brain:brainNo
    });

    if(brain){
    res.json(brain)
    }

})

router.get('/brain/:id',async(req,res)=> {
    const brain = await Brain.findById(req.params.id);
    if(brain){
        res.json(brain)
    }else {
        res.status(404);
        throw new Error("User not Found");
      }

})


router.put('/brain/:id', async(req,res)=>{
    const getBrain = await Brain.findById(req.params.id);

   

    if(getBrain){
        getBrain.brain = req.body.brainNo;

        const updatedBrain = await getBrain.save();

        res.json({
            brain: updatedBrain.brain
        })

     }
    else{
         res.status(404);
         throw new Error("User not Found");
     }



})

module.exports = router;