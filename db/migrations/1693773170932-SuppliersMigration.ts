import { MigrationInterface, QueryRunner } from "typeorm";

export class SuppliersMigration1693773170932 implements MigrationInterface {
    name = 'SuppliersMigration1693773170932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "country" character varying NOT NULL, "address" character varying NOT NULL, "email" character varying NOT NULL, "logo" character varying NOT NULL, CONSTRAINT "PK_2bc0d2cab6276144d2ff98a2828" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "supplier"`);
    }

}
