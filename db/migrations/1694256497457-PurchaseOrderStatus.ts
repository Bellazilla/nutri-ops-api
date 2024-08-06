import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderStatus1694256497457 implements MigrationInterface {
    name = 'PurchaseOrderStatus1694256497457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" integer`);
    }

}
