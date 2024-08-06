import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderLineItemsUpdate1694120280269 implements MigrationInterface {
    name = 'PurchaseOrderLineItemsUpdate1694120280269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_a5c087175e47e3c67da2cd30975"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_26b082d47299ceb0acf517c163e"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_a5c087175e47e3c67da2cd30975" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_26b082d47299ceb0acf517c163e" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_26b082d47299ceb0acf517c163e"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_a5c087175e47e3c67da2cd30975"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_26b082d47299ceb0acf517c163e" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_a5c087175e47e3c67da2cd30975" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
