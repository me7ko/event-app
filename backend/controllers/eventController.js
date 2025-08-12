const knex = require("knex")(require("../../knexfile").development);

// helpers
const toISO = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const isFutureDate = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return false;
  // +60s буфер, за да не отхвърляме "точно сега"
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

/* LIST (for current user) */
exports.getUserEvents = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const offset = (page - 1) * limit;

  const q = (req.query.q || "").trim();
  const sort = (req.query.sort || "asc").toLowerCase();
  const sortDir = sort === "desc" ? "desc" : "asc";

  try {
    let base = knex("events").where({ user_id: userId });

    if (q) {
      base = base.andWhere(function () {
        this.whereILike("name", `%${q}%`).orWhereILike("location", `%${q}%`);
      });
    }

    const [{ count }] = await base.clone().count("* as count");

    const events = await base
      .clone()
      .orderBy("datetime", sortDir)
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

/* GET BY ID (owned by user) */
exports.getEventById = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const event = await knex("events")
      .where({ id: eventId, user_id: userId })
      .first();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({ event });
  } catch (err) {
    console.error("Error fetching event:", err);
    return res.status(500).json({ message: "Error fetching event" });
  }
};

/* UPDATE */
exports.updateEvent = async (req, res) => {
  const userId = req.user.id;
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
    // първо намираме събитието, за да различим 404 от 403
    const existing = await knex("events").where({ id: eventId }).first();
    if (!existing) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (existing.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: Not your event." });
    }

    const updated = await knex("events")
      .where({ id: eventId, user_id: userId })
      .update({
        name,
        description: description ?? null,
        datetime: iso,
        location,
        max_attendees: normalizeMax(max_attendees),
        updated_at: knex.fn.now(),
      })
      .returning("*");

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

  try {
    const existing = await knex("events").where({ id: eventId }).first();

    if (!existing) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (existing.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: Not your event." });
    }

    await knex("events").where({ id: eventId }).del();
    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    return res.status(500).json({ message: "Error deleting event" });
  }
};
