import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendProductEntityWithMinimumReorderAmount1716194355317 implements MigrationInterface {
    name = 'ExtendProductEntityWithMinimumReorderAmount1716194355317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "minimumReorderAmount" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "minimumReorderAmount"`);
    }

}
