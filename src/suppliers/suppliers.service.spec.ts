import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Supplier } from './suppliers.entity';
import { Repository } from 'typeorm';
import { Inventory } from 'inventory/inventory.entity';
import { Product } from 'products/products.entity';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let supplierRepository: Repository<Supplier>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: getRepositoryToken(Supplier), useClass: Repository },
        { provide: getRepositoryToken(Inventory), useClass: Repository },
        { provide: getRepositoryToken(Product), useClass: Repository },
        {
          provide: getRepositoryToken(PS_Product, 'presta'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PS_Stock_Available, 'presta'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PS_Product_Attribute, 'presta'),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    supplierRepository = module.get<Repository<Supplier>>(
      getRepositoryToken(Supplier),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all suppliers', async () => {
    const suppliers: Supplier[] = [
      {
        /* create a sample supplier object */
      },
    ] as any; // Provide sample data
    jest.spyOn(supplierRepository, 'find').mockResolvedValueOnce(suppliers);

    const result = await service.findAll();

    expect(result).toEqual(suppliers);
    expect(supplierRepository.find).toHaveBeenCalled();
  });
});
