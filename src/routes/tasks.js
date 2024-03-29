const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')


router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch (e) {
        res.status(404).send(e)
    }
})

router.get('/tasks', auth, async (req, res) => {

    const match = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    try{

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            },
            sort: {
                completed: -1
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch (e) {

    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    //User.findById(_id)
   try{

        const task = await Task.findOne({ _id, owner: req.user._id})
        res.send(task)

       if(!task){
           res.status(404).send()
       }

   }catch (e) {
        res.status(404).send()
   }
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }

    try{

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})


        if(!task){
            return res.status(400).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

         res.send(task)
    }catch (e) {
        res.status(400).send(e)
    }


})

router.delete('/tasks/:id', auth, async (req, res) => {

    try{

        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})



        if(!task){
            return  res.status(404).send("greska")
        }

        res.send( 'uspesno')

    }catch (e) {
        res.status(500).send()

    }
})

module.exports = router


