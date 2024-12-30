import Router from "./router";

const app = new Router();

app.get("/", (req, res) => {
    return res.text("SAMPLE GET REQ");
});

app.post("/", (req, res) => {
    return res.text("SAMPLE POST REQ");
});

app.post("/echo", async (req, res) => {
    let body = await req.text();
    return res.text(body);
});

addEventListener("fetch", (event) => {
	event.respondWith(app.fetch(event.request));
});
