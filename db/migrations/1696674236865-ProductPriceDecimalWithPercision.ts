import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductPriceDecimalWithPercision1696674236865 implements MigrationInterface {
    name = 'ProductPriceDecimalWithPercision1696674236865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "price" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "price" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "price" TYPE numeric`);
    }

}
