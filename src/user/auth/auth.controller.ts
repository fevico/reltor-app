import { Controller, Post, Body, Param, ParseEnumPipe, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dto/auth.dto';
import { UserType } from '@prisma/client';
import * as bcrypt from "bcryptjs"
import { User, userInfo } from '../decorator/user.docorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){
        
    }
    @Post('/signup/:userType')
   async signup(@Body() body: SignupDto, @Param('userType', new ParseEnumPipe(UserType)) userType: UserType) {
        if(userType !== UserType.BUYER ){
            if(!body.productKey){
                throw new UnauthorizedException()
            }
            const validateProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`
            const isValidProductKey = await bcrypt.compare(validateProductKey, body.productKey)

            if(!isValidProductKey){
                throw new UnauthorizedException()
            }
        }
    
        return this.authService.signup(body, userType)
    }

    @Post('/signin')
    signin(@Body() body: SigninDto){
        return this.authService.signin(body)
    }

    @Post('/key')
    generateProductKey(@Body() {userType, email}: GenerateProductKeyDto){
        return this.authService.generateProductKey(email, userType);
    }

    @Get("/me")
    me(@User() user: userInfo){
        return user
    }
}
