import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductCountMigrationFix1715464165775 implements MigrationInterface {
    name = 'ProductCountMigrationFix1715464165775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_order_count" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "count" integer NOT NULL, "productId" integer, CONSTRAINT "PK_c01aa189bfb9cad12815c13206b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_order_count" ADD CONSTRAINT "FK_4240414258a989acf6396e958b5" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_order_count" DROP CONSTRAINT "FK_4240414258a989acf6396e958b5"`);
        await queryRunner.query(`DROP TABLE "product_order_count"`);
    }

}
