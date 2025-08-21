const knex = require("knex")(require("../../knexfile").development);

const toISO = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const isFutureDate = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return false;

  return d.getTime() > Date.now() + 60_000;
};

const normalizeMax = (v) =>
  v === undefined || v === null || v === "" ? null : Number(v);

/* CREATE */
exports.createEvent = async (req, res) => {
  const { name, description, datetime, location, max_attendees } = req.body;
  const userId = req.user.id;

  if (!name || !datetime || !location) {
    return res
      .status(400)
      .json({ message: "Name, datetime and location are required." });
  }

  const iso = toISO(datetime);
  if (!iso) return res.status(400).json({ message: "Invalid date format." });
  if (!isFutureDate(iso)) {
    return res
      .status(400)
      .json({ message: "Event date must be in the future." });
  }

  try {
    const [event] = await knex("events")
      .insert({
        name,
        description: description ?? null,
        datetime: iso,
        location,
        max_attendees: normalizeMax(max_attendees),
        user_id: userId,
      })
      .returning("*");

    return res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error("Error creating event:", err);
    return res.status(500).json({ message: "Error creating event" });
  }
};

exports.getUserEvents = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role || "user";
  const isAdmin = role === "admin";

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const offset = (page - 1) * limit;

  const q = (req.query.q || "").trim();
  const sort = (req.query.sort || "asc").toLowerCase();
  const sortDir = sort === "desc" ? "desc" : "asc";

  try {
    let base = knex("events")
      .leftJoin("users", "events.user_id", "users.id")
      .select("events.*", knex.raw("users.email AS owner_email"));

    if (!isAdmin) {
      base = base.where("events.user_id", userId);
    }

    if (q) {
      base = base.andWhere(function () {
        this.whereILike("events.name", `%${q}%`).orWhereILike(
          "events.location",
          `%${q}%`
        );
      });
    }

    const [{ count }] = await base
      .clone()
      .clearSelect()
      .countDistinct("events.id as count");

    const events = await base
      .clone()
      .orderBy("events.datetime", sortDir)
      .limit(limit)
      .offset(offset);

    res.json({
      events,
      total: parseInt(count, 10) || 0,
      page,
      totalPages: Math.max(1, Math.ceil((parseInt(count, 10) || 0) / limit)),
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events" });
  }
};

exports.getEventById = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = (req.user.role || "user") === "admin";
  const eventId = req.params.id;

  try {
    let q = knex("events")
      .leftJoin("users", "events.user_id", "users.id")
      .select("events.*", knex.raw("users.email as owner_email"))
      .where("events.id", eventId);

    if (!isAdmin) {
      q = q.andWhere("events.user_id", userId);
    }

    const event = await q.first();
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({ event });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Error fetching event" });
  }
};

exports.updateEvent = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = (req.user.role || "user") === "admin";
  const eventId = req.params.id;
  const { name, description, datetime, location, max_attendees } = req.body;

  if (!name || !datetime || !location) {
    return res
      .status(400)
      .json({ message: "Name, datetime and location are required." });
  }

  const iso = toISO(datetime);
  if (!iso) return res.status(400).json({ message: "Invalid date format." });
  if (!isFutureDate(iso)) {
    return res
      .status(400)
      .json({ message: "Event date must be in the future." });
  }

  try {
    const existing = await knex("events").where({ id: eventId }).first();
    if (!existing) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!isAdmin && existing.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: Not your event." });
    }

    const whereClause = isAdmin
      ? { id: eventId }
      : { id: eventId, user_id: userId };

    const updated = await knex("events")
      .where(whereClause)
      .update(
        {
          name,
          description: description ?? null,
          datetime: iso,
          location,
          max_attendees: normalizeMax(max_attendees),
          updated_at: knex.fn.now(),
        },
        ["*"]
      );

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({ message: "Event updated", event: updated[0] });
  } catch (err) {
    console.error("Error updating event:", err);
    return res.status(500).json({ message: "Error updating event" });
  }
};

/* DELETE */
exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const isAdmin = (req.user.role || "user") === "admin";

  try {
    const event = await knex("events").where({ id: eventId }).first();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!isAdmin && event.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: Not your event." });
    }

    await knex("events").where({ id: eventId }).del();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting event" });
  }
};
