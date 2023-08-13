const mongoose = require('mongoose');

module.exports = {
    connect: async () => {
        mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("--- Mongoose Connected\n");
        }).catch((error) => {
            console.log(error);
        });
    },

    collection: async (name) => {
        return mongoose.connection.db.collection(name);
    }
};