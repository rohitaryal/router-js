import Router from "./router.js";

const app = new Router();

// Middleware example - logging
app.use((req, res) => {
    console.log(`${req.method} ${req.url.pathname} - IP: ${req.client.ipAddress || 'Unknown'}`);
    console.log('Query params:', req.query);
});

// Error handling middleware
app.use(async (req, res) => {
    // Add request timestamp
    req.timestamp = new Date().toISOString();
});

// Basic routes with all HTTP methods
app.get("/", (req, res) => {
    return res.json({
        message: "Welcome to Enhanced Router!",
        timestamp: req.timestamp,
        query: req.query,
        userAgent: req.headers.get('user-agent')
    });
});

app.post("/users", async (req, res) => {
    try {
        const userData = await req.json();
        return res.json({
            message: "User created",
            data: userData,
            timestamp: req.timestamp
        });
    } catch (error) {
        res.writeHead(400, 'Bad Request');
        return res.json({
            error: "Invalid JSON data",
            message: error.message
        });
    }
});

app.put("/users/:id", (req, res) => {
    return res.json({
        message: `Updated user ${req.query.id || 'unknown'}`,
        timestamp: req.timestamp
    });
});

app.delete("/users/:id", (req, res) => {
    return res.json({
        message: `Deleted user ${req.query.id || 'unknown'}`,
        timestamp: req.timestamp
    });
});

app.patch("/users/:id", (req, res) => {
    return res.json({
        message: `Patched user ${req.query.id || 'unknown'}`,
        timestamp: req.timestamp
    });
});

app.options("/api", (req, res) => {
    // Custom CORS settings
    res.cors({
        origin: 'https://myapp.com',
        methods: 'GET, POST, PUT, DELETE',
        credentials: true
    });
    return res.text('CORS preflight response');
});

// Error handling example
app.get("/error", (req, res) => {
    throw new Error("Intentional error for testing");
});

// Text response
app.get("/hello", (req, res) => {
    const name = req.query.name || 'World';
    return res.text(`Hello, ${name}!`);
});

// HTML response
app.get("/page", (req, res) => {
    return res.html(`
        <html>
            <head><title>Router Test</title></head>
            <body>
                <h1>Enhanced Router</h1>
                <p>Query params: ${JSON.stringify(req.query)}</p>
                <p>User country: ${req.client.country || 'Unknown'}</p>
            </body>
        </html>
    `);
});

// Form data handling
app.post("/upload", async (req, res) => {
    try {
        const formData = await req.formdata();
        return res.json({
            message: "Form data received",
            fields: Object.fromEntries(formData.entries())
        });
    } catch (error) {
        res.writeHead(400, 'Bad Request');
        return res.json({
            error: "Invalid form data",
            message: error.message
        });
    }
});

addEventListener("fetch", (event) => {
    event.respondWith(app.fetch(event.request));
});

export default app;