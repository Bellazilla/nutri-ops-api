import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductSupplierId1693853264164 implements MigrationInterface {
    name = 'ProductSupplierId1693853264164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "quanitity"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "quantity" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ADD "supplierId" integer`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_4346e4adb741e80f3711ee09ba4" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_4346e4adb741e80f3711ee09ba4"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "supplierId"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "quanitity" character varying`);
    }

}
