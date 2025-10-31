import mongoose from "mongoose";

const connectDB = async ()=> {
    try {
        mongoose.connection.on('connected',()=>{
            console.log("Successfully connected to mongodb.");
            
        });

        const MONGODB_URI = process.env.MONGODB_URI;
        const projectName = "mero-resume";

        if(MONGODB_URI.endsWith('/')){
            MONGODB_URI = MONGODB_URI.slice(0,-1);
        }

        await mongoose.connect(`${MONGODB_URI}/${projectName}`);
    } catch (error) {
         console.error("❌ MongoDB connection failed:", error);
    }
}

export default connectDB ;