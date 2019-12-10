const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.post('/users/login', async  (req, res) => {
    try{

        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        //console.log('a')
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutALL', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})

/*router.get('/users', auth, async  (req, res) => {
    User.find().then( (users) => {
        res.send(users)
    }).catch( () => {

    })
})*/

router.get('/users/me', auth, (req, res) => {
    res.send(req.user)
    //console.log(req.user)
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
            res.status(201).send({user, token})
    }catch (e) {
        res.status(400).send(e)
    }

    /*user.save().then( () => {
        res.send(user)
    }).catch( (e) => {
        res.status(400).send(e)

    })*/
})

// router.patch('/users/:id', async (req, res) => {
//
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => {
//         return allowedUpdates.includes(update)
//     })
//
//     if(!isValidOperation){
//         return res.status(400).send({error: 'Invalid updates'})
//     }
//
//     try{
//         const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//             new: true, // vraca update usera a ne pronadjenog
//             runValidators: true // radi se i validacija
//         })
//         const user = await User.findById(req.params.id)
//         updates.forEach((update) => {
//             user[update] = req.body[update]
//         })
//         await user.save()
//
//         if(!user){
//             return res.status(400).send()
//         }
//         res.send(user)
//     }catch (e) {
//         res.status(400).send(e)
//     }
// })


 router.patch('/users/me', auth, async (req, res) => {

     const updates = Object.keys(req.body)
     const allowedUpdates = ['name', 'email', 'password', 'age']
     const isValidOperation = updates.every((update) => {
         return allowedUpdates.includes(update)
     })

     if(!isValidOperation){
         return res.status(400).send({error: 'Invalid updates'})
     }

     try{

        updates.forEach((update) => req.user[update] = req.body[update])
         await req.user.save()

         res.send(req.user  )
     }catch (e) {
         res.status(400).send(e)
     }
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

router.delete('/users/me', auth, async (req, res) => {

    try{
        //const user = await User.findByIdAndDelete(req.user._id)

        await req.user.remove()
        res.send(req.user)

    }catch (e) {
        res.status(500).send()

    }
})

module.exports = router
