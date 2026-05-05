const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.NODE_ENV === 'test' 
            ? 'mongodb://localhost:27017/diary_db_test' 
            : process.env.MONGODB_URI;
        const conn = await mongoose.connect(uri);
        if (process.env.NODE_ENV !== 'test') {
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
