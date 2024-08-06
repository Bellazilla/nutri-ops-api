import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PS_Product } from '../presta_entities/presta-product.ps-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';

@Injectable()
export class PrestaProductService {
  constructor(
    @InjectRepository(PS_Product, 'presta')
    private readonly prestaProductRepository: Repository<PS_Product>,
    @InjectRepository(PS_Product_Attribute, 'presta')
    private readonly prestaProductAttributeRepository: Repository<PS_Product_Attribute>,
  ) {}

  async getPrestaProducts() {
    return await this.prestaProductRepository.find({
      relations: ['images', 'information', 'manufacturer'],
    });
  }

  async getPrestaCombinationProducts() {
    return await this.prestaProductAttributeRepository.find({
      relations: [
        'product',
        'product.images',
        'product.information',
        'product.manufacturer',
        'images',
      ],
    });
  }
}
