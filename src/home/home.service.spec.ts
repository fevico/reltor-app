import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';

const mockGetHome = [
  {
                id: 1,
                address: "2345 william stir",
                city: "Toronto",
                price: 300000,
                image: 'img1',
                propertyType: PropertyType.RESIDENTIAL,
                number_of_bathrooms: 3,
                number_of_bedrooms: 2.7,
                images: [
                     {
                        url: "src1"
                    },
                  ],
            }
]

const mockHome = {
  id: 1,
  address: "2345 william stir",
  city: "Toronto",
  price: 300000,
  image: 'img1',
  propertyType: PropertyType.RESIDENTIAL,
  number_of_bathrooms: 3,
  number_of_bedrooms: 2.7,
}

const mockImages = [
  {
    id: 1,
    url: "src1"
  },
  {
    id: 2,
    url: "src2"
  }
]

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService,
      {
        provide: PrismaService,
        useValue: {
          home:{
            findMany: jest.fn().mockReturnValue(mockGetHome),
            create: jest.fn().mockReturnValue(mockHome)
          },
        image: {
          createMany: jest.fn().mockReturnValue([mockImages])
        },
      }
      }],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService)
  });

  it('should be defined', async() => {
    const mockCreate = jest.fn().mockReturnValue(mockHome)
    jest.spyOn(prismaService.home, "create").mockImplementation(mockCreate)
  
    expect(service).toBeDefined();
  });
});
