import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrdersWithBaseEntity1694030744251 implements MigrationInterface {
    name = 'PurchaseOrdersWithBaseEntity1694030744251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "reference" character varying NOT NULL, "supplierId" integer, CONSTRAINT "PK_ad3e1c7b862f4043b103a6c8c60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchase_order_products_product" ("purchaseOrderId" integer NOT NULL, "productId" integer NOT NULL, CONSTRAINT "PK_8c8d07beb28b5cfcec40239eab9" PRIMARY KEY ("purchaseOrderId", "productId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4d7d0d616b2e0034c82e24505b" ON "purchase_order_products_product" ("purchaseOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e8d24ed2bf368d116b61a965f0" ON "purchase_order_products_product" ("productId") `);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_e4ea5841622429c12889a487f31" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products_product" ADD CONSTRAINT "FK_4d7d0d616b2e0034c82e24505b6" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products_product" ADD CONSTRAINT "FK_e8d24ed2bf368d116b61a965f0f" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_products_product" DROP CONSTRAINT "FK_e8d24ed2bf368d116b61a965f0f"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products_product" DROP CONSTRAINT "FK_4d7d0d616b2e0034c82e24505b6"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_e4ea5841622429c12889a487f31"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e8d24ed2bf368d116b61a965f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d7d0d616b2e0034c82e24505b"`);
        await queryRunner.query(`DROP TABLE "purchase_order_products_product"`);
        await queryRunner.query(`DROP TABLE "purchase_order"`);
    }

}
