import { MigrationInterface, QueryRunner } from "typeorm";

export class ErrorLogs1700032755728 implements MigrationInterface {
    name = 'ErrorLogs1700032755728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "error_log" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_0284e7aa7afe77ea1ce1621c252" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "error_log"`);
    }

}
