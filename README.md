# 👒 router-js
Enhanced simple router for CloudFlare workers with comprehensive error handling and modern features ⛅

## ✨ Features

- ✅ All HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- ✅ Route parameters (`/users/:id`)
- ✅ Query parameter parsing
- ✅ Middleware support
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ CORS configuration
- ✅ Request body parsing (JSON, text, form data)
- ✅ CloudFlare Worker optimized
- ✅ TypeScript friendly

## 🎄 Basic Usage
```js
import Router from "./router.js";

const app = new Router();

app.get("/", (req, res) => {
    return res.json({
        "message": "Request received"
    });
});

addEventListener("fetch", (event) => {
    event.respondWith(app.fetch(event.request));
});
```

## 🚀 Advanced Usage

### HTTP Methods
```js
app.get("/users", (req, res) => res.json({ users: [] }));
app.post("/users", (req, res) => res.json({ created: true }));
app.put("/users/:id", (req, res) => res.json({ updated: req.params.id }));
app.delete("/users/:id", (req, res) => res.json({ deleted: req.params.id }));
app.patch("/users/:id", (req, res) => res.json({ patched: req.params.id }));
app.options("/api", (req, res) => res.text("CORS preflight"));
```

### Route Parameters
```js
app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    return res.json({ userId });
});

app.get("/posts/:postId/comments/:commentId", (req, res) => {
    return res.json({
        postId: req.params.postId,
        commentId: req.params.commentId
    });
});
```

### Query Parameters
```js
app.get("/search", (req, res) => {
    const { q, limit, offset } = req.query;
    return res.json({ query: q, limit, offset });
});
// GET /search?q=javascript&limit=10&offset=0
```

### Middleware
```js
// Logging middleware
app.use((req, res) => {
    console.log(`${req.method} ${req.url.pathname}`);
});

// Authentication middleware
app.use(async (req, res) => {
    const token = req.headers.get('authorization');
    if (!token) {
        return res.json({ error: 'Unauthorized' }, 401);
    }
    // Add user to request
    req.user = await validateToken(token);
});
```

### Request Body Handling
```js
app.post("/api/data", async (req, res) => {
    try {
        const jsonData = await req.json();
        return res.json({ received: jsonData });
    } catch (error) {
        res.writeHead(400, 'Bad Request');
        return res.json({ error: error.message });
    }
});

app.post("/upload", async (req, res) => {
    try {
        const formData = await req.formdata();
        return res.json({ files: formData.keys() });
    } catch (error) {
        return res.json({ error: error.message });
    }
});
```

### CORS Configuration
```js
app.options("/api/*", (req, res) => {
    res.cors({
        origin: 'https://myapp.com',
        methods: 'GET, POST, PUT, DELETE',
        headers: 'Content-Type, Authorization',
        credentials: true
    });
    return res.text('');
});
```

### Error Handling
```js
app.get("/error-example", (req, res) => {
    throw new Error("Something went wrong!");
    // Automatically returns 500 JSON error response
});
```

## 📡 Request Object (`req`)

### Properties
- `req.method` - HTTP method
- `req.url` - URL object
- `req.headers` - Request headers
- `req.params` - Route parameters object
- `req.query` - Query parameters object
- `req.client` - CloudFlare client info (IP, country, etc.)

### Methods
- `await req.text()` - Get body as text (1MB limit)
- `await req.json()` - Parse body as JSON
- `await req.formdata()` - Parse body as FormData

## 📤 Response Object (`res`)

### Methods
- `res.json(data)` - Send JSON response
- `res.text(string)` - Send text response
- `res.html(string)` - Send HTML response
- `res.writeHead(status, statusText, headers)` - Set response headers
- `res.cors(options)` - Configure CORS headers

## 🛡️ Error Handling

All errors are automatically caught and return structured JSON responses:

```json
{
    "error": "Internal Server Error",
    "status": 500,
    "message": "Detailed error message"
}
```

Common error scenarios handled:
- Route callback errors (500)
- Middleware errors (500)
- Invalid JSON (400)
- Large request bodies (400)
- Missing routes (404)
- Invalid requests (400)

## 🧪 Testing

Run the included tests:
```bash
node test.js          # Basic functionality tests
node params-test.js   # Route parameters tests
node simple-test.js   # Simple integration test
```

## 📝 Examples

Check the `examples/` directory for:
- `router_1.js` - Basic usage
- `enhanced-router.js` - Full feature demonstration
