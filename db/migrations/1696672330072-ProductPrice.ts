import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductPrice1696672330072 implements MigrationInterface {
    name = 'ProductPrice1696672330072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "price" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
    }

}
