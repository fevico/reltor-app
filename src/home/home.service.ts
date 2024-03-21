import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { userInfo } from 'src/user/decorator/user.docorator';

interface GetHomesParam{
    city?: string;
    price?: {
        gte?: number;
        lte?: number;
    }
    propertyType?: PropertyType
}

interface CreateHomePrams{
    address:              string;
    numberOfBedrooms:   number;
    numberOfBathrooms:  number;
    city:               string;
    price:              number;
    landSize:          number;
    propertyType:       PropertyType;
    images:             {url: string}[];
}

interface UpdateHomePrams{
    address?:              string;
    numberOfBedrooms?:   number;
    numberOfBathrooms?:  number;
    city?:               string;
    price?:              number;
    landSize?:          number;
    propertyType?:       PropertyType;
}

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) {} // Corrected typo in parameter name

    async getHomes(filters:GetHomesParam): Promise<HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            select: {
                id: true,
                address: true,
                city: true,
                price: true,
                propertyType: true,
                number_of_bathrooms: true,
                number_of_bedrooms: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                },
            },
            where: filters
        });

        if(!homes.length){
            throw new NotFoundException()
        }

        // return HomeResponseDto(home)

        return homes.map((home) => {
            const fetchHome = { ...home, image: home.images[0]?.url }; 
            delete fetchHome.images;
            return new HomeResponseDto(fetchHome);
        });
    }

    async getHomesById(id: number){

    }

    async createHome({address, numberOfBathrooms, numberOfBedrooms, city, landSize, price, propertyType, images}: CreateHomePrams, 
        userId: number){
        const home = await this.prismaService.home.create({
            data:{
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                land_size: landSize,
                propertyType,
                price,
                realtor_id: userId
            }
        })
        const homeImages = images.map(image => { 
            return {...image, home_id: home.id}
        })

        await this.prismaService.image.createMany({data: homeImages})
        return new HomeResponseDto(home);
    }

   async updateHomeById(id:number, data: UpdateHomePrams){
    const home = await this.prismaService.home.findUnique({
        where:{
            id
        }
    })
    if(!home){
        throw new NotFoundException();
    }
    const updatedHome = await this.prismaService.home.update({
        where:{
            id
        },
        data
    })
    return new HomeResponseDto(updatedHome)
   }

   async deleteHomeById(id: number){
    await this.prismaService.image.deleteMany({
        where:{
            home_id: id
        }
    });

    await this.prismaService.home.delete({
        where:{
            id,
        }
    })
   }

   async getRealtorByHomeId(id: number){
    const home = await this.prismaService.home.findUnique({
        where:{
            id
        },
        select:{
            realtor:{
                select:{
                    name: true,
                    id: true,
                    email: true,
                    phone: true
                }
            }
        }
    })
    if(!home){
        throw new NotFoundException()
    }
    return home.realtor;
   }

   async inquire(buyer: userInfo, homeId: number, message: string){
    const realtor = await this.getRealtorByHomeId(homeId)
    return this.prismaService.message.create({
        data:{
            realtor_id: realtor.id,
            buyer_id: buyer.id,
            home_id: homeId,
            message,
        }
    })
   }

    getMessagesByHome(homeId: number){
    return this.prismaService.message.findMany({
        where:{
            home_id: homeId
        },
        select:{
            message: true,
            buyer:{
                select:{
                    name: true,
                    phone: true,
                    email: true,
                }
            }
        }
    })
   }
}

// REALTOR
//  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiIsImlkIjo3LCJpYXQiOjE3MTA1MTMwNDgsImV4cCI6MTcxNDExMzA0OH0.iwTsn_XLiTyo0RhBsliuose3YRCn4losAdn5Ja8-uR8


// BUYER 
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmFuZSIsImlkIjo0LCJpYXQiOjE3MTA1MTg3MzMsImV4cCI6MTcxNDExODczM30.ZxK4CIJrYnUMdfnjpVqnUvCYLu2T2DDoZWqZ3EEpIEU