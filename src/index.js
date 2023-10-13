/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import api from './api-router';
import gtfs from "./gtfs-router"
import home from './html/home.html';
// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request, env, ctx) {
		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url);
		console.log("URL", url.pathname)
		// OCTRANSPO has a dedicated router.
		if (url.pathname.startsWith('/api/')) {
			// OCTRANSPO Routes, Separate Router
			return api.handle(request,env,ctx);
		} else if (url.pathname.startsWith('/gtfs/')) {
			return gtfs.handle(request,env,ctx);
		}
		return new Response(
			home,
			{ headers: { 'Content-Type': 'text/html' } }
		);
	},
}