const mongoose = require('mongoose');

const db = async () => {
    console.log(`Connecting to database`);
    const db_uri = process.env.MONGO_URI;
    try {
        await mongoose.connect(db_uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log(`Connected to database`);
    } catch (error) {
        console.log('connection error', error);
        process.exit(1);
    }
};

export default db;