import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

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

        const user = new userModel({})

    }catch (error){
        res.json({success:false,message:error.message})
    }
}