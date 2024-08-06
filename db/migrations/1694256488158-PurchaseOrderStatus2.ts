import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderStatus21694256488158 implements MigrationInterface {
    name = 'PurchaseOrderStatus21694256488158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" integer`);
    }

}
