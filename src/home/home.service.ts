import { Injectable, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { PropertyType } from '@prisma/client';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte: number;
  };
  propertyType: PropertyType;
}

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  image: { url: string }[];
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        image: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter,
    });
    return homes.map((home) => {
      const fetchHome = { ...home, image: home.image[0].url };
      delete fetchHome.image;
      return new HomeResponseDto(fetchHome);
    });
  }

  async createHome({
    address,
    numberOfBedrooms,
    numberOfBathrooms,
    price,
    city,
    landSize,
    propertyType,
    image,
  }: CreateHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bedrooms: numberOfBedrooms,
        number_of_bathrooms: numberOfBathrooms,
        city,
        land_size: landSize,
        propertyType,
        price,
        realtor_id: 4,
      },
    });

    const homeImages = image.map((image) => {
      return { ...image, home_id: home.id };
    });


  }
}
