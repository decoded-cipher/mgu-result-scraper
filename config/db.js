const mongoose = require('mongoose');

module.exports = {
    connect: () => {
        mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("--- Mongoose Connected\n");
        }).catch((error) => {
            console.log(error);
        });
    },

    collection: (name) => {
        return mongoose.connection.db.collection(name);
    }
};