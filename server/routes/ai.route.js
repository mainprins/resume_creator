import express from "express"
import { protect } from "../middlewares/auth.middleware.js";
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume } from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post('/enhance-prof-summary',protect,enhanceProfessionalSummary);
aiRouter.post('/enhance-job-description',protect,enhanceJobDescription);
aiRouter.post('/upload-resume',protect,uploadResume);

export default aiRouter;