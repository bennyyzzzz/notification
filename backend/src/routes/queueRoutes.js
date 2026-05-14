import express from "express";

const router = express.Router();

let queue = [];

router.post("/", (req, res) => {
  const item = {
    id: Date.now(),
    ...req.body,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  queue.push(item);

  res.status(201).json(item);
});

router.get("/", (req, res) => {
  res.json(queue);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  queue = queue.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...req.body,
        updatedAt: new Date().toISOString()
      };
    }

    return item;
  });

  const updatedItem = queue.find((item) => item.id === id);

  res.json(updatedItem);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  queue = queue.filter((item) => item.id !== id);

  res.json({
    success: true
  });
});

router.post("/:id/duplicate", (req, res) => {
  const id = Number(req.params.id);

  const item = queue.find((item) => item.id === id);

  if (!item) {
    return res.status(404).json({
      error: "Item não encontrado"
    });
  }

  const duplicated = {
    ...item,
    id: Date.now(),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  queue.push(duplicated);

  res.status(201).json(duplicated);
});

export default router;