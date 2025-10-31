import ai from "../configs/ai.config.js";
import Resume from "../models/Resume.model.js";

export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: "Required fields cannot be empty." })
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system", content: `
                    You are an expert career coach and professional resume writer. 
                    Your task is to improve and rewrite the user's professional summary so that it sounds confident, polished, and impactful. 

                    Guidelines:
                    - Maintain the original meaning and strengths of the user's summary.
                    - Use clear, professional language suitable for resumes or LinkedIn profiles.
                    - Keep it concise (ideally 2–4 sentences).
                    - Avoid clichés and overly generic phrases like "hard-working" or "team player".
                    - Emphasize measurable skills, achievements, or areas of expertise when possible.
                    - Maintain a natural, human tone (not robotic or overly formal).

                    Output only the improved professional summary — no explanations or extra text.
` },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent });
    } catch (error) {
        console.log("Error in enhanceProfessionalSummary controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}

export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: "Required fields cannot be empty." })
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: `
You are an expert HR specialist and professional job description writer. 
Your task is to improve and rewrite the user's job description to make it clear, professional, and engaging.

Guidelines:
- Preserve the original intent, responsibilities, and key details.
- Use concise, action-oriented language that highlights impact and accountability.
- Keep the tone professional and consistent with modern job descriptions.
- Organize information logically — focus on duties, achievements, and relevant skills.
- Avoid unnecessary filler words or vague terms like "various tasks" or "etc."
- Maintain a natural, human tone (not robotic or overly formal).

Output only the enhanced job description — no explanations or extra text. Not more than 150 words
`
                },

                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent });
    } catch (error) {
        console.log("Error in enhanceJobDescription controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}

export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        const userId = req.userId;

        if (!resumeText) {
            return res.status(400).json({ message: "Please upload a text-based pdf." })
        }

        const systemPrompt = `You are an expert AI agent to extract data from resume.`
        const userPrompt = `extract data from this resume ${resumeText}

        Provide data in the following JSON format with no additional text before or after:

        {
           professional_summary: { type: String, default: '' },
    skills: [{ type: String }],
    personal_info: {
        image: { type: String, default: '' },
        full_name: { type: String, default: '' },
        profession: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' },
    },
    experience: [{
        company: { type: String },
        position: { type: String },
        start_date: { type: String },
        end_date: { type: String },
        description: { type: String },
        is_checked: { type: Boolean },
    }],
    project: [{
        name: { type: String },
        type: { type: String },
        description: { type: String },
    }],
     education: [{
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        graduation: { type: String },
        gpa: { type: String },
    }]
        }
        `
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },

                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            response_format: { type: 'json_object' }
        })

        const extractedData = response.choices[0].message.content;
        const parsedData = JSON.parse(extractedData);

        const newResume = await Resume.create({ userId, title, ...parsedData })
        return res.json({ resumeId: newResume._id });
    } catch (error) {
        console.log("Error in enhanceJobDescription controller", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}