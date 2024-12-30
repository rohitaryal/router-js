# 👒 router-js
Very simple router for my CloudFlare workers ⛅

## 🎄 Usage
```js
import Router from "./router";

const app = new Router();

app.get("/", (req, res) => {
    return res.json({
        "message": "Request recieved"
    });
});

addEventListener("fetch", (event) => {
    event.respondWith(app.fetch(event.request));
});
```
