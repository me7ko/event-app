const knex = require("knex")(require("../../knexfile").development);

// Помощна функция за проверка на бъдеща дата
const isFutureDate = (dateStr) => {
  return new Date(dateStr) > new Date();
};

exports.createEvent = async (req, res) => {
  const { name, description, datetime, location, max_attendees } = req.body;
  const userId = req.user.id;

  if (!name || !datetime || !location) {
    return res
      .status(400)
      .json({ message: "Name, datetime and location are required." });
  }

  if (!isFutureDate(datetime)) {
    return res
      .status(400)
      .json({ message: "Event date must be in the future." });
  }

  try {
    const [event] = await knex("events")
      .insert({
        name,
        description,
        datetime,
        location,
        max_attendees,
        user_id: userId,
      })
      .returning("*");

    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating event" });
  }
};

exports.getUserEvents = async (req, res) => {
  const userId = req.user.id;

  try {
    const events = await knex("events")
      .where({ user_id: userId })
      .orderBy("datetime", "asc");
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching events" });
  }
};

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

    res.json({ event });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Error fetching event" });
  }
};

exports.updateEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;
  const { name, description, datetime, location, max_attendees } = req.body;

  if (!name || !datetime || !location) {
    return res
      .status(400)
      .json({ message: "Name, datetime and location are required." });
  }

  if (new Date(datetime) <= new Date()) {
    return res
      .status(400)
      .json({ message: "Event date must be in the future." });
  }

  try {
    const updated = await knex("events")
      .where({ id: eventId, user_id: userId })
      .update({
        name,
        description,
        datetime,
        location,
        max_attendees,
        updated_at: knex.fn.now(),
      })
      .returning("*");

    if (updated.length === 0) {
      return res.status(404).json({ message: "Event not found or not yours." });
    }

    res.json({ message: "Event updated", event: updated[0] });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Error updating event" });
  }
};

exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await knex("events")
      .where({ id: eventId, user_id: userId })
      .first();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await knex("events").where({ id: eventId }).del();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting event" });
  }
};
