import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderLineItem1694087768767 implements MigrationInterface {
    name = 'PurchaseOrderLineItem1694087768767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order_line_item" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "quantity" integer NOT NULL, "purchaseOrderId" integer, "productId" integer, CONSTRAINT "PK_b1a53331c2f8280eacd42c1de1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_a5c087175e47e3c67da2cd30975" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" ADD CONSTRAINT "FK_26b082d47299ceb0acf517c163e" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_26b082d47299ceb0acf517c163e"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_line_item" DROP CONSTRAINT "FK_a5c087175e47e3c67da2cd30975"`);
        await queryRunner.query(`DROP TABLE "purchase_order_line_item"`);
    }

}
