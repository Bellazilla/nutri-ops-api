import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseOrderJunctionTable1694034329349 implements MigrationInterface {
    name = 'PurchaseOrderJunctionTable1694034329349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_e4ea5841622429c12889a487f31"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "supplierId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_e4ea5841622429c12889a487f31" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_e4ea5841622429c12889a487f31"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ALTER COLUMN "supplierId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_e4ea5841622429c12889a487f31" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
