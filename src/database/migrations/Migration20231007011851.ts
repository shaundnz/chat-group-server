import { Migration } from '@mikro-orm/migrations';

export class Migration20231007011851 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "message" add column "user_id" varchar(255) not null;');
    this.addSql('alter table "message" add constraint "message_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "message" drop constraint "message_user_id_foreign";');

    this.addSql('alter table "message" drop column "user_id";');
  }

}
