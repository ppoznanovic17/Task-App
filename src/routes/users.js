const express = require('express')
const router = new express.Router()
const User = require('../models/user')


router.patch('/users/:id', async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }

    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // vraca update usera a ne pronadjenog
            runValidators: true // radi se i validacija
        })
        if(!user){
            return res.status(400).send()
        }
        res.send(user)
    }catch (e) {
        res.status(400).send(e)
    }
})


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        res.status(201).send(user)
    }catch (e) {
        res.status(400).send(e)
    }

    /*user.save().then( () => {
        res.send(user)
    }).catch( (e) => {
        res.status(400).send(e)

    })*/
})

router.patch('/users/:id', async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }

    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // vraca update usera a ne pronadjenog
            runValidators: true // radi se i validacija
        })
        if(!user){
            return res.status(400).send()
        }
        res.send(user)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users', (req, res) => {
    User.find().then( (users) => {
        res.send(users)
    }).catch( () => {

    })
})

router.get('/users/:id', (req, res) => {
    const _id = req.params.id

    //User.findById(_id)

    User.find({_id: _id}).then( (users) => {
        res.send(users)
    }).catch( (err) => {
        res.send(err)
    })
})

router.delete('/users/:id', async (req, res) => {

    try{
        const user = User.remove({ _id: req.params.id }, function(err) {
            if (!err) {
                res.send("uspesno ")
            }
            else {
                res.send('neuspesno')
            }
        });

        if(!user){
            return  res.status(404).send("greska")
        }

        res.send('uspesno')

    }catch (e) {
        res.status(500).send()

    }
})

module.exports = router
