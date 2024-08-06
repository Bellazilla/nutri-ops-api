import { MigrationInterface, QueryRunner } from "typeorm";

export class OriginalEAN1717584448135 implements MigrationInterface {
    name = 'OriginalEAN1717584448135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "ean_original" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "ean_original"`);
    }

}
