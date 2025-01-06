export default class Router {
	constructor() {
		this.routes = [];
		return this;
	}

	get(url, callback) {
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
			if (route.url === url && route.method == "GET") {
				throw new Error(`Route already exists for ${url}.`);
			}
		});

		this.routes.push({
			url,
			callback,
			method: "GET",
		});
	}

	post(url, callback) {
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
			if (route.url === url && route.method == "POST") {
				throw new Error(`Route already exists for ${url}.`);
			}
		});

		this.routes.push({
			url,
			callback,
			method: "POST",
		});
	}

	async fetch(request, env, ctx) {
		let { pathname } = new URL(request.url);

		for (let route of this.routes) {
			if (route.url === pathname && route.method === request.method) {
				return route.callback(new RouterRequest(request), new RouterResponse(), env, ctx);
			}
		}

		// If not matched return 404
		return new Response(null, {
			status: 404,
			statusText: "NOT FOUND",
		});
	}
}

class RouterResponse {
	constructor() {
		this.header = {
			'Access-Control-Allow-Origin': "*",
			"Server": "Cloudflare Worker",
			"Access-Control-Allow-Headers": "*"
		};
		this.status = 200;
		this.statusText = "OK";
	}

	writeHead(status, statusText, headers) {
		this.header = headers;
		this.status = status;
		this.statusText = statusText;
	}

	json(body) {
		try {
			return new Response(JSON.stringify(body), {
				status: this.status || "200",
				statusText: this.statusText || "",
				headers: {
					...this.header,
					"Content-Type": "application/json",
				},
			});
		} catch (err) {
			throw new Error("Failed to parse to JSON.");
		}
	}

	text(body) {
		return new Response(body, {
			status: this.status || "200",
			statusText: this.statusText || "",
			headers: {
				...this.header,
				"Content-Type": "text/plain",
			},
		});
	}

	html(body) {
		return new Response(body, {
			status: this.status,
			statusText: this.statusText,
			headers: {
				...this.header,
				"Content-Type": "text/html",
			},
		});
	}
}

class RouterRequest {
	// Cloudflare request parameter
	constructor(request) {
		this.client = {
			ipAddress: request.headers.get('cf-connecting-ip'),
			clientTcpRtt: request.cf.clientTcpRtt,
			longitude: request.cf.longitude,
			latitude: request.cf.latitude,
			city: request.cf.city,
			region: request.cf.region,
			regionCode: request.cf.regionCode,
			country: request.cf.country,
			postalCode: request.cf.postalCode,
			timezone: request.cf.timezone,
			asn: request.cf.asn,
			asOrganization: request.cf.asOrganization,
			continent: request.cf.continent,
			httpProtocol: request.cf.httpProtocol,
			botScore: request.cf.botManagement?.score,
			jsDetectionPassed: request.cf.botManagement?.jsDetection?.passed
		};
		this.method = request.method;
		this.url = new URL(request.url);
		this.headers = request.headers;
		this.body = request.body;
		this.request = request;
	}

	async text() {
		return await this.request.text();
	}

	async json() {
		return await this.request.json();
	}

	async formdata() {
		return await this.request.formdata();
	}
}
