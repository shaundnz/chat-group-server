import { Migration } from '@mikro-orm/migrations';

export class Migration20230925110331 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "channel" ("id" varchar(255) not null, "created_at" timestamptz(3) not null, "updated_at" timestamptz(3) not null, "title" varchar(255) not null, "description" varchar(255) not null, "default" boolean not null default false, constraint "channel_pkey" primary key ("id"));',
    );

    this.addSql(
      'create table "message" ("id" varchar(255) not null, "created_at" timestamptz(3) not null, "updated_at" timestamptz(3) not null, "content" varchar(255) not null, "channel_id" varchar(255) not null, constraint "message_pkey" primary key ("id"));',
    );

    this.addSql(
      'create table "user" ("id" varchar(255) not null, "created_at" timestamptz(3) not null, "updated_at" timestamptz(3) not null, "username" varchar(255) not null, "password" varchar(255) not null, constraint "user_pkey" primary key ("id"));',
    );
    this.addSql(
      'alter table "user" add constraint "user_username_unique" unique ("username");',
    );

    this.addSql(
      'alter table "message" add constraint "message_channel_id_foreign" foreign key ("channel_id") references "channel" ("id") on update cascade;',
    );
  }
}
