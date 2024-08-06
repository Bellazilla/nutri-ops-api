import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewType1702237688696 implements MigrationInterface {
    name = 'ReviewType1702237688696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review_invitation" ADD "review_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review_invitation" DROP COLUMN "review_type"`);
    }

}
