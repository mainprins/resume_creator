import imagekit from "../configs/imagekit.js";
import Resume from "../models/Resume.model.js";
import fs from 'fs'

export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;
        const resumes = await Resume.find({ userId });

        return res.status(200).json({ resumes: resumes });
    } catch (error) {
        console.log("Error in getUserResumes controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}

export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title cannot be null.' })
        }

        const newResume = await Resume.create({ userId, title });

        return res.status(201).json({ message: 'New resume created successfully.', resume: newResume });
    } catch (error) {
        console.log("Error in createResume controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}

export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        await Resume.findOneAndDelete({ userId, _id: resumeId });

        return res.status(200).json({ message: 'A resume got deleted successfully.' });
    } catch (error) {
        console.log("Error in deleteResume controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}

export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId });

        if (!resume) {
            return res.status(400).json({ message: "There is no such resume in the database." })
        }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;
        return res.status(200).json({ resume });
    } catch (error) {
        console.log("Error in getResumeById controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}

export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({ public: true, _id: resumeId });

        if (!resume) {
            return res.status(400).json({ message: "There is no such resume in the database." })
        }
        return res.status(200).json({ resume });
    } catch (error) {
        console.log("Error in getPublicResumeById controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}

export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, resumeData, removeBackground } = req.body;
        const image = req.file;
        console.log("Hi",image);
        

        let resumeDataCopy = JSON.parse(resumeData);

        if (image) {
            const imageBufferData = fs.createReadStream(image.path);
           
            const response = await imagekit.files.upload({
                file: imageBufferData,
                fileName: 'resume.png',
                folder: 'user-resumes',
                transformation: {
                    pre : 'w-300,h-300,fo-face,z-0.75'+(removeBackground === 'yes' ? ',e-bgremove' : '')
                }
            });
            resumeDataCopy.personal_info.image = response.url;
        }

        const resume = await Resume.findByIdAndUpdate({ userId, _id: resumeId }, resumeDataCopy, { new: true })

        return res.status(200).json({ message: "Resume got update successfully.", resume })
    } catch (error) {

    }
}