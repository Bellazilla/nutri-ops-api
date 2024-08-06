import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductsMigration1693808019853 implements MigrationInterface {
    name = 'ProductsMigration1693808019853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "brand" character varying, "product" character varying, "rrp" character varying, "wholesalePrice" character varying, "wholesalePriceWithPromo" character varying, "sku" character varying, "ean" character varying, "quanitity" character varying, "productUrl" character varying, "imageUrl" character varying, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
