import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewInvitation1701897820365 implements MigrationInterface {
    name = 'ReviewInvitation1701897820365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email" RENAME COLUMN "recepient" TO "recipient"`);
        await queryRunner.query(`CREATE TABLE "review_invitation" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "referenceId" character varying NOT NULL, "invitation_link" character varying NOT NULL, CONSTRAINT "PK_d57756b8357f51fc84a2a00e3b9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "review_invitation"`);
        await queryRunner.query(`ALTER TABLE "email" RENAME COLUMN "recipient" TO "recepient"`);
    }

}
