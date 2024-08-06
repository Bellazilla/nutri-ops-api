import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderStatus31694256604072 implements MigrationInterface {
    name = 'PurchaseOrderStatus31694256604072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_order_status_enum" AS ENUM('draft', 'created')`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" "public"."purchase_order_status_enum" DEFAULT 'draft'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD "status" integer`);
    }

}
