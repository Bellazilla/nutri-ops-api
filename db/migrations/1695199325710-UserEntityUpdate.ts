import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEntityUpdate1695199325710 implements MigrationInterface {
    name = 'UserEntityUpdate1695199325710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastname" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastname"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    }

}
