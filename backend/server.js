const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Welcome to CampusConnect API");
});

app.listen(PORT, () => {
    console.log(`CampusConnect server running on port ${PORT}`);
});