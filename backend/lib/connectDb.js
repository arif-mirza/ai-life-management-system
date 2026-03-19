const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const globalMongoose = global;

if (!globalMongoose.__lifePortalMongoose) {
  globalMongoose.__lifePortalMongoose = {
    conn: null,
    promise: null
  };
}

const cached = globalMongoose.__lifePortalMongoose;

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

module.exports = connectDB;
