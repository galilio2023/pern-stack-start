import express from "express";

const app = express();
const port = 3000;

const router = express.Router();
app.use(express.json());
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp} ${req.method} ${req.url}]`);
  next();
});
let cars = [
  { id: 1, make: "Toyota", model: "Camry", year: 2022, price: 28000 },
  { id: 2, make: "Tesla", model: "Model S", year: 2022, price: 28000 },
  { id: 3, make: "ford", model: "F-150", year: 2021, price: 35000 },
];
app.get("/", (req, res) => {
  res.send("Hello from the cars API!");
});
router.get("/", (req, res) => {
  res.json(cars);
});
router.get("/:id", (req, res) => {
  const id = +req.params.id;
  const car = cars.find((c) => c.id === id);
  if (!car) return res.status(404).send("Car not found!");
  res.json(car);
});
router.post("/", (req, res) => {
  const maxId = cars.length > 0 ? Math.max(...cars.map((c) => c.id)) : 0;
  const newId = maxId + 1;

  const newCar = { id: newId, ...req.body };
  cars.push(newCar);

  res.status(201).json(newCar);
});
router.put("/:id", (req, res) => {
  // 1. Convert id to a number (params are always strings)
  const id = parseInt(req.params.id);

  // 2. Find the index of the car with that ID
  const carIndex = cars.findIndex((car) => car.id === id);

  // 3. Check if the car exists
  if (carIndex === -1) {
    return res.status(404).json({ message: "Car not found" });
  }

  // 4. Update the car at that index
  // We spread the old car data and overwrite it with the new body data
  const updatedCar = { ...cars[carIndex], ...req.body };
  cars[carIndex] = updatedCar;

  // 5. Send back the updated car
  res.json(updatedCar);
});
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  // 1. Find the index of the car
  const carIndex = cars.findIndex((car) => car.id === id);

  // 2. Handle if the car doesn't exist
  if (carIndex === -1) {
    return res.status(404).json({ message: "Car not found" });
  }

  // 3. Remove the car from the array
  // splice(start, deleteCount)
  const deletedCar = cars.splice(carIndex, 1);

  // 4. Return the deleted item (optional) or a 204 No Content status
  res.json({ message: "Car deleted successfully", car: deletedCar[0] });
});

app.use("/api/v1/cars", router);
app.listen(port, () =>
  console.log(`Server is running on port http://localhost:${port}`),
);
