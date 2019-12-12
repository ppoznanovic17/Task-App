const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

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
        sendWelcomeEmail(user.email, user.name)
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
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)

    }catch (e) {
        res.status(500).send()

    }
})

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10000000000
    },
    fileFilter(req, file, cb) {



        if (!(file.originalname.match(/jpg/gi) || file.originalname.match(/jpeg/gi) || file.originalname.match(/png/gi))) {
            return cb(new Error(' Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatars'),  async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    //console.log(req.user.avatar)
    res.send(req.user.avatar)

}, (error, req, res, next) => {
    res.status(400).send({error: error.message})

})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async  (req, res) => {
    try {

        const  user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            return res.status(400).send()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    }catch (e) {
        res.status(404).send()
    }
})

module.exports = router
