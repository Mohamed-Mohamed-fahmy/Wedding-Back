const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

const db = initDatabase();

app.use(cors());
app.use(express.json());

// Submit RSVP
app.post("/api/rsvp", (req, res) => {
  const { name, email, attendance, guests, dietary, message } = req.body;

  if (!name || !email || !attendance) {
    return res.status(400).json({ error: "Name, email, and attendance are required." });
  }

  if (!["Joyfully Accept", "Regretfully Decline"].includes(attendance)) {
    return res.status(400).json({ error: "Invalid attendance value." });
  }

  const guestCount = attendance === "Joyfully Accept" ? parseInt(guests, 10) || 1 : 0;

  try {
    const stmt = db.prepare(
      "INSERT INTO rsvps (name, email, attendance, guests, dietary, message) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run(
      name.trim(),
      email.trim(),
      attendance,
      guestCount,
      (dietary || "").trim(),
      (message || "").trim()
    );

    res.status(201).json({ id: result.lastInsertRowid, message: "RSVP saved successfully." });
  } catch (err) {
    console.error("Error saving RSVP:", err);
    res.status(500).json({ error: "Failed to save RSVP." });
  }
});

// Get all RSVPs (for admin)
app.get("/api/rsvps", (req, res) => {
  try {
    const rsvps = db.prepare("SELECT * FROM rsvps ORDER BY created_at DESC").all();

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN attendance = 'Joyfully Accept' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN attendance = 'Regretfully Decline' THEN 1 ELSE 0 END) as declined,
        SUM(CASE WHEN attendance = 'Joyfully Accept' THEN guests ELSE 0 END) as total_guests
      FROM rsvps
    `).get();

    res.json({ stats, rsvps });
  } catch (err) {
    console.error("Error fetching RSVPs:", err);
    res.status(500).json({ error: "Failed to fetch RSVPs." });
  }
});

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.listen(PORT, () => {
  console.log(`RSVP backend running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
