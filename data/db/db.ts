var pg = require("pg");

let client: any;
const config = {
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: 26257,
	ssl: {
		rejectUnauthorized: false,
    	ca: process.env.DB_CERTIFICATE,
	}
};
export async function getClient() {
	if (client) {
		return client;
	}

	return new Promise((resolve, reject) => {
		const pool = new pg.Pool(config);
		pool.connect((err, c, done) => {
			if(err) {
				reject(err);
				return;
			}

			c.done = done;
			client = c;
			resolve(client)
		})
	})
}

export async function runQuery(query: string, values: Array<any> = []): Promise<{rows}> {
	return new Promise(async (resolve, reject) => {
		try {
			const c = await getClient();
			c.query(query, values, (err, res) => {
				try {
					if(err) {
						reject(err);
						return;
					}
					resolve(res);
				} catch(e) {
					reject(e);
				}
			});
		} catch(e) {
			reject(e);
		}
	})
}

