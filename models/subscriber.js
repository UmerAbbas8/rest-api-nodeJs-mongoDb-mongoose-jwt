const mongoose = require('mongoose')

const subscriberSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    subscribedToChannel: {
        type: String
    },
    customFields: {
        type: []
    },
    subscribeDate: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    versionKey: false //to avaid "__v": 0 field being added to the documents
})

module.exports = mongoose.model('Subscriber', subscriberSchema)