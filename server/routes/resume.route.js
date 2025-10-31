import express from 'express'
import { protect } from '../middlewares/auth.middleware.js';
import { createResume, deleteResume, getPublicResumeById, getResumeById, getUserResumes, updateResume } from '../controllers/resume.controller.js';
import upload from '../configs/multer.js';

const resumeRouter = express.Router();

resumeRouter.post('/create',protect,createResume);
resumeRouter.put('/update',upload.single('image'),protect,updateResume);
resumeRouter.delete('/delete/:resumeId',protect,deleteResume);
resumeRouter.get('/get/:resumeId',protect,getResumeById);
resumeRouter.get('/public/:resumeId',getPublicResumeById);
resumeRouter.get('/userResumes',protect,getUserResumes);

export default resumeRouter;