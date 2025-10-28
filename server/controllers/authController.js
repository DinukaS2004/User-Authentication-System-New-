import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';

export const register = async (req,res) =>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.json({sucess:false,message:'Missing details'})
    }

    try{

        const exitingUser = await userModel.findOne({email});
        
        if(exitingUser){
          return res.json({sucess:false,message:'User already exists'})  
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({name,email,password:hashedPassword});
        await user.save();

        const token  = jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge:7*24*60*10000

        });

        //sending welcome email
        const mailOPtions = {
            from:process.env.SENDER_EMAIL,
            to: email,
            subject:'Welcome to great stack ',
            text:`Welcome to greatstack wewbsite. Your accouont has been created with email id:${email}`
            
        }
        await transporter.sendMail(mailOPtions);
        return res.json({success:true});

    }catch (error){
        res.json({success:false,message:error.message})
    }
}

export const login = async (req,res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({succes:false,message:'Email and password are required'})
    }

    try{
        const user =  await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message:'Invalid email'})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        
        if(!isMatch){
            return res.json({success:false, message:'Invalid password'})
        }
        const token  = jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge:7*24*60*10000

        });

        return res.json({success:true});
    }catch (error){
        return res.json({success:false,message:error.message});
    }
} 

export const logout = async (req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
        })

        return res.json({success:true,meassage:"Logged out"})
    }catch(error){
        return res.json({success:false,message:error.meassage});
    }
}
// send verification OTP to the user's email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified." });
    }

    //  Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    //  Save OTP and expiry with consistent field names
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // valid for 24h

    await user.save();

    //  Send email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent on email." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details." });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    //  Check OTP match (type-safe)
    if (user.verifyOtp === "" || user.verifyOtp !== String(otp)) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    // Check expiry correctly
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired." });
    }

    // Mark verified
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
