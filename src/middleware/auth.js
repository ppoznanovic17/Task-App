const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res,next) => {

    try {
        const token = req.header('Authorization').replace('Baerer ', '')
        const decoded = jwt.verify(token, 'petar')
        //                                                  gleda u token array-u tokene
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user){
            throw  new Error()
        }

        req.token = token
        req.user = user
        next()
    }catch (e) {
        res.status(401).send({error: 'Please login first'})
    }


}

module.exports = auth;
