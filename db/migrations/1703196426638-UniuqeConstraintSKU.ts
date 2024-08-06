import { MigrationInterface, QueryRunner } from "typeorm";

export class UniuqeConstraintSKU1703196426638 implements MigrationInterface {
    name = 'UniuqeConstraintSKU1703196426638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39"`);
    }

}
