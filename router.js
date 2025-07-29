export default class Router {
	constructor() {
		this.routes = [];
		this.middlewares = [];
		return this;
	}

	use(middleware) {
		if (typeof middleware !== "function") {
			throw new Error("Middleware must be a function.");
		}
		this.middlewares.push(middleware);
	}

	_addRoute(method, url, callback) {
		if (!url || !callback) {
			throw new Error("URL or Callback is not provided.");
		}

		if (typeof url !== "string") {
			throw new Error("URL must be of type string.");
		}

		if (typeof callback !== "function") {
			throw new Error("Callback must be of type function.");
		}

		this.routes.forEach(route => {
			if (route.url === url && route.method == method) {
				throw new Error(`Route already exists for ${method} ${url}.`);
			}
		});

		this.routes.push({
			url,
			callback,
			method: method,
		});
	}

	get(url, callback) {
		this._addRoute("GET", url, callback);
	}

	post(url, callback) {
		this._addRoute("POST", url, callback);
	}

	put(url, callback) {
		this._addRoute("PUT", url, callback);
	}

	delete(url, callback) {
		this._addRoute("DELETE", url, callback);
	}

	patch(url, callback) {
		this._addRoute("PATCH", url, callback);
	}

	options(url, callback) {
		this._addRoute("OPTIONS", url, callback);
	}

	async fetch(request, env, ctx) {
		try {
			// Validate request object
			if (!request || typeof request.url !== 'string') {
				return this._errorResponse(400, 'Invalid request object');
			}

			let { pathname } = new URL(request.url);
			const req = new RouterRequest(request);
			const res = new RouterResponse();

			// Run middlewares
			for (let middleware of this.middlewares) {
				try {
					const result = await middleware(req, res, env, ctx);
					if (result instanceof Response) {
						return result; // Middleware returned a response, short-circuit
					}
				} catch (error) {
					console.error('Middleware error:', error);
					return this._errorResponse(500, 'Middleware Error', error.message);
				}
			}

			// Find and execute route (with parameter matching)
			for (let route of this.routes) {
				const match = this._matchRoute(route.url, pathname);
				if (match && route.method === request.method) {
					// Add matched parameters to request
					req.params = match.params;
					try {
						return await route.callback(req, res, env, ctx);
					} catch (error) {
						console.error('Route callback error:', error);
						return this._errorResponse(500, 'Internal Server Error', error.message);
					}
				}
			}

			// If not matched return 404
			return this._errorResponse(404, 'Not Found', `Route ${request.method} ${pathname} not found`);
		} catch (error) {
			console.error('Router fetch error:', error);
			return this._errorResponse(500, 'Internal Server Error', 'Failed to process request');
		}
	}

	_matchRoute(pattern, pathname) {
		// Convert route pattern to regex (e.g., /users/:id -> /users/([^/]+))
		const paramNames = [];
		const regexPattern = pattern.replace(/:([^/]+)/g, (match, paramName) => {
			paramNames.push(paramName);
			return '([^/]+)';
		});

		const regex = new RegExp('^' + regexPattern + '$');
		const match = pathname.match(regex);

		if (!match) {
			return null;
		}

		// Extract parameters
		const params = {};
		for (let i = 0; i < paramNames.length; i++) {
			params[paramNames[i]] = match[i + 1];
		}

		return { params };
	}

	_errorResponse(status, statusText, message = null) {
		const body = {
			error: statusText,
			status: status
		};
		if (message) {
			body.message = message;
		}
		return new Response(JSON.stringify(body), {
			status: status,
			statusText: statusText,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

class RouterResponse {
	constructor() {
		this.header = {
			'Access-Control-Allow-Origin': "*",
			"Server": "Cloudflare Worker",
			"Access-Control-Allow-Headers": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS"
		};
		this.status = 200;
		this.statusText = "OK";
	}

	cors(options = {}) {
		const {
			origin = "*",
			methods = "GET, POST, PUT, DELETE, PATCH, OPTIONS",
			headers = "*",
			credentials = false
		} = options;

		this.header['Access-Control-Allow-Origin'] = origin;
		this.header['Access-Control-Allow-Methods'] = methods;
		this.header['Access-Control-Allow-Headers'] = headers;
		
		if (credentials) {
			this.header['Access-Control-Allow-Credentials'] = 'true';
		}
		
		return this;
	}

	writeHead(status, statusText, headers) {
		// Validate inputs
		if (typeof status !== 'number' || status < 100 || status > 599) {
			throw new Error('Status must be a number between 100 and 599');
		}
		if (statusText && typeof statusText !== 'string') {
			throw new Error('Status text must be a string');
		}
		if (headers && typeof headers !== 'object') {
			throw new Error('Headers must be an object');
		}

		this.status = status;
		this.statusText = statusText || '';
		if (headers) {
			this.header = { ...this.header, ...headers };
		}
	}

	json(body) {
		try {
			// Validate that body can be serialized
			if (body === undefined) {
				throw new Error("Cannot serialize undefined to JSON");
			}
			const jsonString = JSON.stringify(body);
			return new Response(jsonString, {
				status: this.status || 200,
				statusText: this.statusText || "OK",
				headers: {
					...this.header,
					"Content-Type": "application/json",
				},
			});
		} catch (err) {
			console.error('JSON serialization error:', err);
			throw new Error("Failed to serialize response to JSON: " + err.message);
		}
	}

	text(body) {
		try {
			// Ensure body is a string
			const textBody = body === null || body === undefined ? '' : String(body);
			return new Response(textBody, {
				status: this.status || 200,
				statusText: this.statusText || "OK",
				headers: {
					...this.header,
					"Content-Type": "text/plain",
				},
			});
		} catch (err) {
			console.error('Text response error:', err);
			throw new Error("Failed to create text response: " + err.message);
		}
	}

	html(body) {
		try {
			// Ensure body is a string
			const htmlBody = body === null || body === undefined ? '' : String(body);
			return new Response(htmlBody, {
				status: this.status || 200,
				statusText: this.statusText || "OK",
				headers: {
					...this.header,
					"Content-Type": "text/html",
				},
			});
		} catch (err) {
			console.error('HTML response error:', err);
			throw new Error("Failed to create HTML response: " + err.message);
		}
	}
}

class RouterRequest {
	// Cloudflare request parameter
	constructor(request) {
		if (!request) {
			throw new Error('Request object is required');
		}

		// Safe access to CloudFlare specific properties
		const cf = request.cf || {};
		const botManagement = cf.botManagement || {};
		const jsDetection = botManagement.jsDetection || {};

		this.client = {
			ipAddress: request.headers?.get('cf-connecting-ip') || null,
			clientTcpRtt: cf.clientTcpRtt || null,
			longitude: cf.longitude || null,
			latitude: cf.latitude || null,
			city: cf.city || null,
			region: cf.region || null,
			regionCode: cf.regionCode || null,
			country: cf.country || null,
			postalCode: cf.postalCode || null,
			timezone: cf.timezone || null,
			asn: cf.asn || null,
			asOrganization: cf.asOrganization || null,
			continent: cf.continent || null,
			httpProtocol: cf.httpProtocol || null,
			botScore: botManagement.score || null,
			jsDetectionPassed: jsDetection.passed || null
		};
		this.method = request.method;
		this.url = new URL(request.url);
		this.headers = request.headers;
		this.body = request.body;
		this.request = request;
		
		// Parse query parameters
		this.query = {};
		this.url.searchParams.forEach((value, key) => {
			this.query[key] = value;
		});
	}

	async text() {
		try {
			const text = await this.request.text();
			// Basic size limit check (1MB)
			if (text.length > 1024 * 1024) {
				throw new Error('Request body too large (max 1MB)');
			}
			return text;
		} catch (error) {
			console.error('Failed to parse request as text:', error);
			throw new Error('Failed to parse request body as text: ' + error.message);
		}
	}

	async json() {
		try {
			const text = await this.text(); // This will apply size limits
			if (!text.trim()) {
				throw new Error('Empty request body');
			}
			return JSON.parse(text);
		} catch (error) {
			console.error('Failed to parse request as JSON:', error);
			if (error.message.includes('JSON')) {
				throw new Error('Invalid JSON format: ' + error.message);
			}
			throw new Error('Failed to parse request body as JSON: ' + error.message);
		}
	}

	async formdata() {
		try {
			return await this.request.formData();
		} catch (error) {
			console.error('Failed to parse request as form data:', error);
			throw new Error('Failed to parse request body as form data: ' + error.message);
		}
	}
}
