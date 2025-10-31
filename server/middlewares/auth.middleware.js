import jwt from 'jsonwebtoken'

export const protect = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({ message: 'User is not authorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("Error in protect middleware", error);
        return res.status(400).json({ message: "Internal Server Error" })
    }
}
