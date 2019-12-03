// samo vezba///
/////////////////
///////////////
//////////////////
/////////////


const { MongoClient, ObjectID } = require('src/db/mongodb')

const connectionUrl = 'mongodb://127.0.0.1:27017'
const database = 'task-manager'

const id = new ObjectID()
//console.log(id.getTimestamp())

MongoClient.connect(connectionUrl, {useNewUrlParser: true}, (err, client) =>{
    const db = client.db(database)

    const updatePromise = db.collection('users').updateOne({
        _id: new ObjectID("5de59b30d4f3df00d8f97a43")
    },{
        $inc: {
            age: 50
        }
    })

    updatePromise.then(() => {
        console.log('update')
    }).catch( () => {
        console.log('ne update')
    })

    })

