const express = require('express')
const router = express.Router()
const Task = require('../models/task')


router.post('/tasks', (req, res) => {
    const task = new Task(req.body)

    task.save().then( () =>{
        res.status(201).send(task)
    }).catch( () => {
        res.status(400).send(e)
    })
})

router.get('/tasks', (req, res) => {
    Task.find().then( (tasks) => {
        res.send(tasks)
    }).catch( (err) => {
        res.status(400).send(err)
    })
})

router.get('/tasks/:id', (req, res) => {
    const _id = req.params.id

    //User.findById(_id)

    Task.find({_id: _id}).then( (tasks) => {
        res.send(tasks)
    }).catch( (err) => {
        res.status(400).send(err)
    })
})

router.patch('/tasks/:id', async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }


    try{
        const task = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // vraca update usera a ne pronadjenog
            runValidators: true // radi se i validacija
        })
        if(!task){
            return res.status(400).send()
        }
        res.send(task)
    }catch (e) {
        res.status(400).send(e)
    }


})

router.delete('/tasks/:id', async (req, res) => {

    try{
        const task = Task.remove({ _id: req.params.id }, function(err) {
            if (!err) {
                res.send("uspesno ")
            }
            else {
                res.send('neuspesno')
            }
        });

        if(!task){
            return  res.status(404).send("greska")
        }

        res.send( 'uspesno')

    }catch (e) {
        res.status(500).send()

    }
})

module.exports = router


