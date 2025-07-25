exports.up = function (knex) {
  return knex.schema.createTable("events", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable(); // Event Name
    table.text("description"); // Description
    table.timestamp("datetime").notNullable(); // Date and Time
    table.string("location").notNullable(); // Location
    table.integer("max_attendees"); // Optional
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // FK към users

    table.timestamps(true, true); // created_at и updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("events");
};
