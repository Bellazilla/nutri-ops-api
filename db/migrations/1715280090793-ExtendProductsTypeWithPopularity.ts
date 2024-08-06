import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendProductsTypeWithPopularity1715280090793 implements MigrationInterface {
    name = 'ExtendProductsTypeWithPopularity1715280090793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "popularity" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "popularity"`);
    }

}
