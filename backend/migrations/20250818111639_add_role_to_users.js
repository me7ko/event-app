exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("users", "role");
  if (!hasColumn) {
    await knex.schema.alterTable("users", (table) => {
      table.string("role").notNullable().defaultTo("user"); // "user" | "admin"
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("users", "role");
  if (hasColumn) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("role");
    });
  }
};
