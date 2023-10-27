const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports = {
    connect: () => {
        mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log(chalk.cyanBright("--- Connected to MongoDB Atlas\n"));
        }).catch((error) => {
            console.log(error);
        });
    },

    collection: (name) => {
        return mongoose.connection.db.collection(name);
    }
};