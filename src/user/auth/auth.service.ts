import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcryptjs"
import {UserType} from "@prisma/client"
import * as jwt from "jsonwebtoken";

interface SignupParams {
    email: string;
    password: string;
    name: string;
    phone: string
}

interface SigninParams {
    email: string;
    password: string;
}

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService){}
    async signup({email, password, name, phone}: SignupParams, userType: UserType){
        const userExist = await this.prismaService.user.findUnique({
            where: {
                email,
            }
        })
        if(userExist){
            throw new ConflictException()
        }
        const hasedPassword = await bcrypt.hash(password, 10)
        const user = await this.prismaService.user.create({
            data:{
                email,
                name,
                phone,
                password: hasedPassword,
                user_type: userType,
            }
        }); 

        return this.generateJWT(name, user.id)

    }

    async signin({email, password}: SigninParams){
        const user = await this.prismaService.user.findUnique({
            where:{
                email
            }
        })
        if(!user){
            throw new HttpException("Invalid credentials", 400);
        }
        const hasedPassword = user.password;
        const isValidPassword = await bcrypt.compare(password, hasedPassword)
        if(!isValidPassword){
            throw new HttpException("Invalid credentials", 400);
        }
        
        return this.generateJWT(user.name, user.id)
    }

   private generateJWT(name: string, id: number){
    
    return jwt.sign({
        name,
        id
    }, process.env.JSON_SECRET, {expiresIn: 3600000});
   }

   generateProductKey(email: string, userType: UserType){
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`

    return bcrypt.hash(string, 10);
   }
   
}

