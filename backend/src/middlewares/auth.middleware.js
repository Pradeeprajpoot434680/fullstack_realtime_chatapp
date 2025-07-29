import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'
export const protectRoute = async(req,res,next)=>{
    const token = req.cookies.jwt;
    
    
    try {
        if(!token){
        return res.status(401).json({message:"Unauthorized - No token provided"})
        }
        
        const decodedRes = jwt.verify(token,process.env.JWT_SECRET)
        
        if(!decodedRes){
            return res.status(401).json({message:"Unauthorized - No token provided"})
        }

        const user = await User.findById(decodedRes.userId).select("-password")
        if(!user){
            res.status(404).json({
                message:"User not fount"
            })
        }

        req.user = user
        next()
    } catch (error) {
        console.log("Error in the protectRoute middleware");
        res.status(500).json({message:"internal server error"})
        
    }

}