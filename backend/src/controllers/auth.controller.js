import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js'
import z from 'zod';
import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
const signupValidation = z.object({
  email: z.string().email(),
  fullName: z.string().min(1, { message: "Full name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const signup = async(req,res)=>{
    const { email,password,fullName} = req.body;
    try
    {
            const response = signupValidation.safeParse(req.body);
                
            if (!response.success) {
            return res.status(400).json({
                message: "Validation failed",
             });
        }
                
    }


    catch(err){
        return res.status(400).json({
           
            message:'Data Validation fails:'
        })
        
        
    }
    try {
        //hash the password
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword =bcryptjs.hashSync(password,salt);

        //check this mail is present in the db or not
        const existingUser = await User.findOne({ email: email });

        if(existingUser){
            return res.json({
                message:"You have already an account"
            })
        }
        
        //now create an user
        const dbUser = new User({
            email,
            password:hashedPassword,
            fullName
        })
        if(dbUser){
            //generate a token 
            generateToken(dbUser._id,res);
            await dbUser.save();
            return res.status(201).json({
                message:"user signup successfully"
            })
        }
        else{
            return res.status(400).json({
                message:"Invalid user data",
                user:dbUser
            })
        }


    } catch (error) {
       return res.json({
        error:"error while signup"
       })
    }
   
}

export const login = async(req,res)=>{
   const { email , password} = req.body;
   try {
    const user = await User.findOne({email});

    if(!user){
        return res.status(404).json({
            message:"Invalid credantials"
        })
    }
    
    const isPasswordCorrect = await bcryptjs.compare(password,user.password);
    
    if(!isPasswordCorrect){
        return res.status(404).json({
            message:"Invalid credantials"
        })
    }

    generateToken(user._id,res);

    return res.status(201).json({
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        profilePic:user.profilePic
    })

   } catch (error) {
    console.log("Error in login controller");
    return res.status(500).json({
        message:"internal server error"
    })
    
   }
}

export const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("Error in login controller");
        return res.status(500).json({message:"internal server error"})
    }
}

export const updateProfile = async(req,res)=>{
try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "profile pic is required" });
    }

    // Convert buffer to base64 string with mime type prefix
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64Image);

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("error in updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"internal Server Error"})
        
    }
}