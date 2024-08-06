import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderStatusesUpdate1694462600856 implements MigrationInterface {
    name = 'PurchaseOrderStatusesUpdate1694462600856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."purchase_order_status_enum" RENAME TO "purchase_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_order_status_enum" AS ENUM('draft', 'created', 'cancelled', 'wmsNotified', 'wmsArrival', 'wmsInbound', 'wmsDeflection', 'wmsReceived', 'wmsCancelled')`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "status" TYPE "public"."purchase_order_status_enum" USING "status"::"text"::"public"."purchase_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."purchase_order_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."purchase_order_status_enum_old" AS ENUM('draft', 'created')`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "status" TYPE "public"."purchase_order_status_enum_old" USING "status"::"text"::"public"."purchase_order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."purchase_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."purchase_order_status_enum_old" RENAME TO "purchase_order_status_enum"`);
    }

}
