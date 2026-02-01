import express from "express";
import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { cars } from "./schema.js";

const app = express();
const PORT = 3000;

// 1. Middleware
app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// 2. Routes
const router = express.Router();

// GET all cars
router.get("/", async (req, res) => {
  try {
    const allCars = await db.select().from(cars);
    res.json(allCars);
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// GET one car
router.get("/:id", async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const [car] = await db
      .select()
      .from(cars)
      .where(eq(cars.id, carId))
      .limit(1);

    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST new car
router.post("/", async (req, res) => {
  const { make, model, year, price } = req.body;

  if (!make || !model || !year || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [newCar] = await db
      .insert(cars)
      .values({ make, model, year, price })
      .returning();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ error: "Could not save car" });
  }
});

// PUT update car
router.put("/:id", async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const { make, model, year, price } = req.body;

    const updatedCars = await db
      .update(cars)
      .set({
        make,
        model,
        year: year ? parseInt(year) : undefined,
        price: price ? price.toString() : undefined,
      })
      .where(eq(cars.id, carId))
      .returning();

    if (updatedCars.length === 0)
      return res.status(404).json({ error: "Car not found" });
    res.json(updatedCars[0]);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE car
router.delete("/:id", async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const deletedCars = await db
      .delete(cars)
      .where(eq(cars.id, carId))
      .returning();

    if (deletedCars.length === 0)
      return res.status(404).json({ error: "Car not found" });
    res.json({ message: "Car deleted", car: deletedCars[0] });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// 3. Mounting - Now all routes are under /api/v1/cars
app.use("/api/v1/cars", router);

// 4. Global Error Handler
app.use((err, req, res, next) => {
  res
    .status(500)
    .json({ error: "Something went wrong!", message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚗 Car API running at http://localhost:${PORT}/api/v1/cars`);
});
