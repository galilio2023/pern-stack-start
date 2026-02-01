import express from "express";

const app = express();
const PORT = 3000;

const router = express.Router();

app.use(express.json());

let cars = [
  { id: 1, make: "Toyota", model: "Camry", year: 2022, price: 28000 },
  { id: 2, make: "Tesla", model: "Model S", year: 2023, price: 25000 },
  { id: 3, make: "Ford", model: "F-150", year: 2021, price: 35000 },
];

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello from Car API!");
});

router.get("/cars", (req, res) => {
  res.json(cars);
});

router.post("/cars", (req, res) => {
  const { make, model, year, price } = req.body;

  if (!make || !model || !year || !price) {
    return res.status(400).json({
      error: "Please provide make, model, year, and price",
    });
  }

  const nextId = cars.length + 1;

  const newCar = {
    id: nextId,
    make,
    model,
    year: parseInt(year),
    price: parseFloat(price),
  };

  cars.push(newCar);

  res.status(201).json(newCar);
});

router.put("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Car not found" });
  }

  const { make, model, year, price } = req.body;

  if (make) cars[carIndex].make = make;
  if (model) cars[carIndex].model = model;
  if (year) cars[carIndex].year = parseInt(year);
  if (price) cars[carIndex].price = parseFloat(price);

  res.json(cars[carIndex]);
});

router.delete("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Car not found" });
  }

  const deletedCar = cars.splice(carIndex, 1)[0];

  res.json({
    message: "Car deleted successfully",
    car: deletedCar,
  });
});

router.get("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const car = cars.find((c) => c.id === carId);

  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }

  res.json(car);
});

app.use("/api/v1", router);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
