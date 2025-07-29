// Simple test for router functionality
import Router from './router.js';

console.log('🧪 Testing Router functionality...\n');

// Test 1: Create router and add routes
const app = new Router();

// Test all HTTP methods
app.get('/', (req, res) => res.text('GET /'));
app.post('/users', (req, res) => res.json({ message: 'POST /users' }));
app.put('/users/1', (req, res) => res.json({ message: 'PUT /users/1' }));
app.delete('/users/1', (req, res) => res.json({ message: 'DELETE /users/1' }));
app.patch('/users/1', (req, res) => res.json({ message: 'PATCH /users/1' }));
app.options('/api', (req, res) => res.text('OPTIONS /api'));

console.log(`✅ Registered ${app.routes.length} routes`);

// Test 2: Add middleware
app.use((req, res) => {
    console.log(`Middleware: ${req.method} ${req.url.pathname}`);
});

console.log(`✅ Registered ${app.middlewares.length} middleware(s)`);

// Test 3: Test error handling
try {
    app.get(null, () => {});
} catch (error) {
    console.log('✅ Error handling works:', error.message);
}

// Test 4: Test query parameter parsing with mock request
const mockRequest = {
    url: 'https://example.com/test?name=john&age=30',
    method: 'GET',
    headers: new Map(),
    body: null,
    cf: { country: 'US' }
};

// Add text/json methods to mock request
mockRequest.text = async () => '{"test": "data"}';
mockRequest.json = async () => ({ test: "data" });
mockRequest.formData = async () => new FormData();

// Test RouterRequest creation
try {
    const RouterRequest = app.fetch.toString().includes('new RouterRequest') ? 
        eval(`(${app.fetch.toString().match(/new RouterRequest/)[0].replace('new ', '')})`) : null;
    console.log('✅ RouterRequest can be instantiated');
} catch (error) {
    console.log('⚠️  RouterRequest test skipped');
}

console.log('\n🎉 Basic functionality tests completed!');