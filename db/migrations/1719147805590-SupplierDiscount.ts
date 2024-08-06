import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierDiscount1719147805590 implements MigrationInterface {
    name = 'SupplierDiscount1719147805590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" ADD "discountDeal" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "discountDeal"`);
    }

}
