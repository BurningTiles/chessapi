const express = require("express");
const app = express();
const request = require("request-promise");
const cheerio = require("cheerio");

const link = "https://www.chessgames.com/chessecohelp.html";
var db = false;

// Scrape the data from the website.
const getData = () => {
	request(link, (error, response, html) => {
		if (!error && response.statusCode == 200) {
			const $ = cheerio.load(html);

			db = {};
			$("tr").each((i, data) => {
				let text = $(data).text();
				let id = text.substring(0, 3);
				text = text.substring(3, text.length);
				let [title, code] = text.split("\n");
				db[id] = { title, code };
			});

			console.log("Ready to response...");
		}
	});
	return true;
};
var start = getData();


// To get all data
app.get("/", (req, res) => {
	if (!db) res.end("Database is not ready...\nPlease wait for some time...");
	else {
		res.end(JSON.stringify(db, null, 2));
	}
});


// To refresh data
app.get("/refresh", (req, res) => {
	getData();
	res.end("Data updated successfully...");
});

// To get data of particular id or code
app.get("/:id", (req, res) => {
	let id = req.params.id;
	if (db[id]) res.end(JSON.stringify(db[id], null, 2));
	else res.end(JSON.stringify({ error: "Not found" }, null, 2));
});

// To fetch next move
app.get("/:id/*", (req, res) => {
	let id = req.params.id;
	let moves = req.params[0].split('/');
	if (db[id]) {
		let code = db[id].code.split(" ");
		code = code.filter(x => isNaN(x));
		if(moves.length<code.length){
			let i=0;
			while(i<moves.length && moves[i]==code[i]) i++;
			if(i==moves.length){
				res.end(JSON.stringify({ "nextMove":code[i] }, null, 2));
				return;
			}
		}
	} 
	res.end(JSON.stringify({ error: "Not found" }, null, 2));
});

app.listen(3000, () => console.log("Listening on port 3000..."));