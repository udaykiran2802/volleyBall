const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing:Joi.object({
        title: Joi.string().required(),
        description:Joi.string().required(),
        country:Joi.string().required(),
        location:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.object({
            url:Joi.string().allow("" , null),
            filename :  Joi.string().allow("" , null),
    }),

    category: Joi.string().valid("mountains", "arctic", "farms", "Iconic Cities", "castles", "Amazing Pools", "camping", "domes", "boats" ,"rooms").required()
    
    }).required()
});
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

module.exports.playerSchema = Joi.object({
    player:Joi.object({
        name: Joi.string().required(),
        image:Joi.object({
            url:Joi.string().allow("" , null),
            filename :  Joi.string().allow("" , null),
    }),
    scholarID: Joi.string().required(),

    position: Joi.string().valid("Hitter", "Setter", "Libero","AllRounder").required(),
    size: Joi.string().valid("XS", "S", "M","L","XL").required(),
    branch: Joi.string().required()
     
    }).required()
});

const subscriptionSchema = Joi.object({ 
    endpoint: Joi.string().uri().required(), 
    keys: Joi.object({ 
        p256dh: Joi.string().required(), 
        auth: Joi.string().required() 
    }).required() 
}); 
 
module.exports = subscriptionSchema; 