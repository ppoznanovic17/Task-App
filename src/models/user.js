const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invaild')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw  new Error('Password cannot contain word "password" ')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be possitive number')
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]

}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userPublic = user.toObject()

    delete userPublic.password
    delete userPublic.tokens

    return userPublic
}

userSchema.statics.findByCredentials = async (email, password) => {
    console.log('usao')
    const user = await  User.findOne({ email })
    if(!user){
        console.log('username')
        throw new Error('Unable to login. Wrong username.')
    }
    console.log(password)
    console.log( await bcrypt.hash(password,8))
    console.log(user.password)
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        console.log('password')
        throw new Error('Unable to login. Wrong password.')
    }
    console.log("gotovo")
    return user

}

userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString()},'petar')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}


// hesiranje password-a
userSchema.pre('save',async function (next) {
    const user = this

    if (user.isModified('password')){
        user.password = await  bcrypt.hash(user.password,8)
    }

    next()
})

//brisanje taskova kada se user obrise
userSchema.pre('remove', async function(next) {

    const user = this
    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
