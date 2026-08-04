import { defineEventHandler, getQuery, readBody } from 'h3';
import fs from 'fs';
import path from 'path';

// Memory cache for active node
let currentNodeUrl = '';
let lastUpdatedAt = 0;

const STORAGE_FILE = path.join(process.cwd(), '.sentinel-node.json');

// Load stored node if exists
try {
    if (fs.existsSync(STORAGE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
        currentNodeUrl = data.url || '';
        lastUpdatedAt = data.updatedAt || 0;
    }
} catch(e) {}

export default defineEventHandler(async (event) => {
    const method = event.node.req.method;

    if (method === 'POST') {
        const body = await readBody(event) || {};
        const query = getQuery(event) || {};
        const url = body.url || query.url;
        const secret = body.secret || query.secret;

        if (url) {
            currentNodeUrl = String(url).trim();
            lastUpdatedAt = Date.now();

            try {
                fs.writeFileSync(STORAGE_FILE, JSON.stringify({
                    url: currentNodeUrl,
                    updatedAt: lastUpdatedAt
                }));
            } catch(e) {}

            return { success: true, url: currentNodeUrl, updatedAt: lastUpdatedAt };
        }
        return { error: 'Missing url parameter' };
    }

    // GET Request
    const query = getQuery(event) || {};
    if (query.set_url) {
        currentNodeUrl = String(query.set_url).trim();
        lastUpdatedAt = Date.now();
        try {
            fs.writeFileSync(STORAGE_FILE, JSON.stringify({
                url: currentNodeUrl,
                updatedAt: lastUpdatedAt
            }));
        } catch(e) {}
    }

    return {
        url: currentNodeUrl,
        updatedAt: lastUpdatedAt,
        isOnline: Boolean(currentNodeUrl)
    };
});
