import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierIsActiveProperty1710073988056 implements MigrationInterface {
    name = 'SupplierIsActiveProperty1710073988056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" ADD "is_active" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "is_active"`);
    }

}
