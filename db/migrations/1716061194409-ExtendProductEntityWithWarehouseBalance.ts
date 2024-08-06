import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendProductEntityWithWarehouseBalance1716061194409 implements MigrationInterface {
    name = 'ExtendProductEntityWithWarehouseBalance1716061194409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "warehouse_stock" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "warehouse_stock"`);
    }

}
