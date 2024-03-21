import { PropertyType } from "@prisma/client";
import {Exclude, Expose, Type} from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";


export class HomeResponseDto {
        id: number;
        address: string;

        @Exclude()
        number_of_bedrooms: number;

        @Expose({name: "numberOfBedroom"})
        numberOfBedrooms(){
            return this.number_of_bedrooms
        }

        @Exclude()
        number_of_bathrooms: number;

        @Expose({name: "numberOfBathrooms"})
        numberOdBathrooms(){
            return this.number_of_bathrooms
        }

        city: string;

        @Exclude()
        listed_date: Date;

        @Expose({name: "listedDate"})
        listedDate(){
            return this.listed_date
        }
        price: number;
        image: string;

        @Exclude()
        land_size: number;

        @Expose({name: "landSize"})
        landSize(){
            return this.land_size
        }
        propertyType: PropertyType;
        @Exclude()
        created_at: Date;
        @Exclude()
        updated_at: Date;
        @Exclude()
        realtor_id: number

    constructor(partial: Partial<HomeResponseDto>){
        Object.assign(this, partial)
    }
}

class Image {
    @IsString()
    @IsNotEmpty()
    url: string;
}

export class createHomeDto {
    @IsString()
    @IsNotEmpty()
    address:              string;

    @IsNumber()
    @IsPositive()
    numberOfBedrooms:   number;

    @IsNumber()
    @IsPositive()
    numberOfBathrooms:  number;

    @IsString() 
    city:               string;

    @IsNumber()
    @IsPositive()
    price:              number;

    @IsNumber()
    @IsPositive()
    landSize:          number;

    @IsEnum(PropertyType)
    propertyType:       PropertyType;

    @IsArray()
    @ValidateNested({each: true})
    @Type(()=>Image)
    images:             Image[]
}

export class UpdateHomeDto{
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address?:              string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    numberOfBedrooms?:   number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    numberOfBathrooms?:  number;

    @IsOptional()
    city?:               string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?:              number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    landSize?:          number;

    @IsOptional()
    @IsEnum(PropertyType)
    propertyType?:       PropertyType;

    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(()=>Image)
    images?:             Image[]
}

export class InquireDto{
    @IsString()
    @IsNotEmpty()
    message: string
}