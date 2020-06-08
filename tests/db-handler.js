/**
 * acknowledgement : this code is inspired by https://dev.to/paulasantamaria/testing-node-js-mongoose-with-an-in-memory-database-32np?fbclid=IwAR2bhtTQSKp7ARxhA9HpapdjzsM1f3_ITPuwh-THthgqT619WZtMPUKhszk
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Grid = require('gridfs-stream');
const mongod = new MongoMemoryServer();
global.gfsImages = undefined;
/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
    const uri = await mongod.getConnectionString();

    const mongooseOpts = {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    };

    await mongoose.connect(uri, mongooseOpts); 
    gfsImages = new Grid(mongoose.connection.db, mongoose.mongo);
    gfsImages.collection('images');
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};