import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderStatus1694256310087 implements MigrationInterface {
    name = 'PurchaseOrderStatus1694256310087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
    }

}
