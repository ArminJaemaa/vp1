const express = require ("express");
const app = express();

app.get("/", (req, res)=> {
	res.send("express läks täiesti käima");
});

app.listen(5133);