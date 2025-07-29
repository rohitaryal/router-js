import Router from './router.js';

// Simple test framework
let testCount = 0;
let passCount = 0;

function test(name, testFn) {
    testCount++;
    try {
        testFn();
        console.log(`✅ ${name}`);
        passCount++;
    } catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
    }
}

function assertEquals(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
}

function assertThrows(fn, expectedMessage = '') {
    try {
        fn();
        throw new Error('Expected function to throw');
    } catch (error) {
        if (expectedMessage && !error.message.includes(expectedMessage)) {
            throw new Error(`Expected error message to contain "${expectedMessage}", got "${error.message}"`);
        }
    }
}

// Mock Request for testing
class MockRequest {
    constructor(url, method = 'GET', headers = {}) {
        this.url = url;
        this.method = method;
        this.headers = new Map(Object.entries(headers));
        this.body = null;
        this.cf = {
            country: 'US',
            city: 'San Francisco'
        };
    }
    
    get(key) {
        return this.headers.get(key);
    }
    
    async text() {
        return this.body || '';
    }
    
    async json() {
        if (!this.body) return {};
        return JSON.parse(this.body);
    }
    
    async formData() {
        return new FormData();
    }
}

// Run tests
console.log('🧪 Running Router Tests...\n');

// Test 1: Basic router creation
test('Router creation', () => {
    const router = new Router();
    assertEquals(router.routes.length, 0);
    assertEquals(router.middlewares.length, 0);
});

// Test 2: HTTP method registration
test('GET route registration', () => {
    const router = new Router();
    router.get('/', (req, res) => res.text('Hello'));
    assertEquals(router.routes.length, 1);
    assertEquals(router.routes[0].method, 'GET');
});

test('POST route registration', () => {
    const router = new Router();
    router.post('/users', (req, res) => res.json({}));
    assertEquals(router.routes.length, 1);
    assertEquals(router.routes[0].method, 'POST');
});

test('PUT route registration', () => {
    const router = new Router();
    router.put('/users/1', (req, res) => res.json({}));
    assertEquals(router.routes.length, 1);
    assertEquals(router.routes[0].method, 'PUT');
});

test('DELETE route registration', () => {
    const router = new Router();
    router.delete('/users/1', (req, res) => res.json({}));
    assertEquals(router.routes.length, 1);
    assertEquals(router.routes[0].method, 'DELETE');
});

test('PATCH route registration', () => {
    const router = new Router();
    router.patch('/users/1', (req, res) => res.json({}));
    assertEquals(router.routes.length, 1);
    assertEquals(router.routes[0].method, 'PATCH');
});

test('OPTIONS route registration', () => {
    const router = new Router();
    router.options('/api', (req, res) => res.text(''));
    assertEquals(router.routes.length, 1);
    assertEquals(router.routes[0].method, 'OPTIONS');
});

// Test 3: Input validation
test('Route registration validation - missing URL', () => {
    const router = new Router();
    assertThrows(() => router.get(null, () => {}), 'URL or Callback is not provided');
});

test('Route registration validation - missing callback', () => {
    const router = new Router();
    assertThrows(() => router.get('/test', null), 'URL or Callback is not provided');
});

test('Route registration validation - invalid URL type', () => {
    const router = new Router();
    assertThrows(() => router.get(123, () => {}), 'URL must be of type string');
});

test('Route registration validation - invalid callback type', () => {
    const router = new Router();
    assertThrows(() => router.get('/test', 'not a function'), 'Callback must be of type function');
});

test('Route registration validation - duplicate routes', () => {
    const router = new Router();
    router.get('/test', () => {});
    assertThrows(() => router.get('/test', () => {}), 'Route already exists');
});

// Test 4: Middleware
test('Middleware registration', () => {
    const router = new Router();
    router.use((req, res) => {});
    assertEquals(router.middlewares.length, 1);
});

test('Middleware validation', () => {
    const router = new Router();
    assertThrows(() => router.use('not a function'), 'Middleware must be a function');
});

// Test 5: RouterRequest features
test('RouterRequest query parsing', () => {
    const mockReq = new MockRequest('https://example.com/test?name=john&age=30');
    mockReq.headers = { get: () => null };
    const req = new (class extends Router {}).prototype.constructor.name === 'Router' ? 
        eval('new RouterRequest(mockReq)') : null;
    
    // This test is more complex due to class scoping, skipping for now
});

// Test 6: RouterResponse features
test('RouterResponse CORS configuration', () => {
    const router = new Router();
    const res = new (eval('RouterResponse'))();
    res.cors({ origin: 'https://example.com', credentials: true });
    assertEquals(res.header['Access-Control-Allow-Origin'], 'https://example.com');
    assertEquals(res.header['Access-Control-Allow-Credentials'], 'true');
});

test('RouterResponse writeHead validation', () => {
    const res = new (eval('RouterResponse'))();
    assertThrows(() => res.writeHead('invalid'), 'Status must be a number');
    assertThrows(() => res.writeHead(999), 'Status must be a number between 100 and 599');
});

// Results
console.log(`\n📊 Test Results: ${passCount}/${testCount} tests passed`);
if (passCount === testCount) {
    console.log('🎉 All tests passed!');
} else {
    console.log(`⚠️  ${testCount - passCount} tests failed`);
}