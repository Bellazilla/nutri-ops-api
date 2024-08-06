import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderCascadeTrue1696272863681 implements MigrationInterface {
    name = 'PurchaseOrderCascadeTrue1696272863681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_a5c087175e47e3c67da2cd30975"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_a5c087175e47e3c67da2cd30975" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_a5c087175e47e3c67da2cd30975"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_a5c087175e47e3c67da2cd30975" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
