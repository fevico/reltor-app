import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import * as jwt from "jsonwebtoken"
import { PrismaService } from "src/prisma/prisma.service"

interface JWTPayload {
    id: number;
    name: string;
    iat: number;
    exp: number;
}


@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private readonly reflector: Reflector,
        private readonly prismaService: PrismaService
        ){}
    async canActivate(context: ExecutionContext){
        //1  determine the user type that can execute the called endpoint 
        const roles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass()
        ])

        if(roles?.length){
        // 2 grab the jWT from the request and verify it 
            const request = context.switchToHttp().getRequest()
            const token = request.headers?.authorization?.split("Bearer ")[1]
            try {
               const payload = await jwt.verify(token, process.env.JSON_SECRET) as JWTPayload 

               const user = await this.prismaService.user.findUnique({
                where:{
                    id: payload.id,
                }
               });
               if(!user) return false    
            if(roles.includes(user.user_type)) return true 
               return false
            } catch (error) { 
               return false 
            }
        } 

        // 4 determine if the user has permissions 
        return true
    } 
}