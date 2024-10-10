const mongoose = require('mongoose'); 
 
const subscriptionSchema = new mongoose.Schema({ 
    endpoint: { type: String, required: true, unique: true }, 
    keys: { 
        p256dh: String, 
        auth: String 
    }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Associate with user 
}); 
 
module.exports = mongoose.model('Subscription', subscriptionSchema);