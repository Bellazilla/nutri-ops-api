import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrestaProductService } from './presta-product.service';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';

describe('PrestaProductService', () => {
  let prestaProductService: PrestaProductService;
  const mockProduct: PS_Product = {
    ean13: '0001234567891',
    id_product: 1,
    price: 20,
  } as PS_Product;
  const mockCombinationProduct: PS_Product_Attribute = {
    id_product: 2,
    price: 0,
  } as PS_Product_Attribute;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrestaProductService,
        {
          provide: getRepositoryToken(PS_Product, 'presta'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PS_Product_Attribute, 'presta'),
          useClass: Repository,
        },
      ],
    }).compile();

    prestaProductService =
      module.get<PrestaProductService>(PrestaProductService);
  });

  it('should be defined', () => {
    expect(prestaProductService).toBeDefined();
  });

  describe('getPrestaProducts', () => {
    it('should return an array of products', async () => {
      jest
        .spyOn(prestaProductService['prestaProductRepository'], 'find')
        .mockResolvedValueOnce([mockProduct]);

      const result = await prestaProductService.getPrestaProducts();

      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getPrestaCombinationProducts', () => {
    it('should return an array of combination products', async () => {
      jest
        .spyOn(prestaProductService['prestaProductAttributeRepository'], 'find')
        .mockResolvedValueOnce([mockCombinationProduct]);

      const result = await prestaProductService.getPrestaCombinationProducts();

      expect(result).toEqual([mockCombinationProduct]);
    });
  });
});
