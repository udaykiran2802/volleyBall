const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');


main()
.then(()=>{
    console.log("Mongo database is connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"6678cf129850a5506f7c665d"}));
    await Listing.insertMany(initData.data);
    console.log("DB is initilised");
}
initDB();