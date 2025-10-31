import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./configs/db.config.js";
import authRouter from "./routes/auth.route.js";
import resumeRouter from "./routes/resume.route.js";
import aiRouter from "./routes/ai.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connecting to mongoDB

await connectDB();

app.use(express.json());
app.use(cors());

app.get('/',(req,res)=>{
    res.send("Server is live.")
});
app.use('/api/auth',authRouter);
app.use('/api/resume',resumeRouter);
app.use('/api/ai',aiRouter);

app.listen(PORT,()=>{
    console.log(`Server is listening at ${PORT}`);
    
})