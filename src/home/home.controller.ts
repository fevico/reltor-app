import { Controller, Get, Post, Put, Delete, Query, Param, ParseIntPipe, Body, UnauthorizedException } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto, InquireDto, UpdateHomeDto, createHomeDto } from './dto/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { User, userInfo } from 'src/user/decorator/user.docorator';
import {UseGuards} from "@nestjs/common"
import {AuthGuard} from "src/guards/auth.guard"
import { Roles } from 'src/decorators/roles.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
    ): Promise<HomeResponseDto[]> {

        const price = minPrice || maxPrice ?  {
            ...(minPrice && {gte: parseFloat(minPrice)}),
            ...(maxPrice && {lte: parseFloat(maxPrice)}),
        } : undefined
        const filters = {
            ...(city && {city}),
            ...(price && {price}),
            ...(propertyType && {propertyType}),
        }
        console.log({city, maxPrice, minPrice, propertyType})
    return this.homeService.getHomes(filters); 
  }

  @Get(':id')
  getHome(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getHomesById(id)
  }

  @Roles(UserType.REALTOR)
  @Post()
  createHome(@Body() body: createHomeDto, @User() user: userInfo) {
    // return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,  
    @User() user: userInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id); 
    if(realtor.id !== user.id){
        throw new UnauthorizedException()
    }
    return this.homeService.updateHomeById(id, body);
  }

  @Roles(UserType.REALTOR)
  @Delete(':id')
  async deleteHome(@Param('id', ParseIntPipe) id: number, @User() user: userInfo) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if(realtor.id !== user.id){
        throw new UnauthorizedException()
    }

    return this.homeService.deleteHomeById(id);
  }

  
  @Roles(UserType.BUYER)
  @Post('/:id/inquire')   
  inquire(@Param('id', ParseIntPipe) homeId: number, @User() user: userInfo, @Body() {message}: InquireDto ){
    return this.homeService.inquire(user, homeId, message)
  }
    
  @Roles(UserType.REALTOR) 
  @Get(':id/message')
  async getHomeMessages(@Param('id', ParseIntPipe) id: number, @User() user: userInfo){  
    const realtor = await this.homeService.getRealtorByHomeId(id); 
    if(realtor.id !== user.id){
        throw new UnauthorizedException()
    } 

    return this.homeService.getMessagesByHome(id)
  }

}
