/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import oc_rtr from './octranspo-router';
import oc_static_update from './update/oc_static';
import oc_time_update from './update/oc_times';
import oc_trips_udt from './update/oc_trips';
import home from './html/home.html';
// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request, env, ctx) {
		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url);
		function collectJSONResponse(res, code) {
			// Returns a Response with JSON parsed and ready to go.
			return new Response(
				JSON.stringify(res), {
				status: code || 418,
				// If code is not provided return 418, because I'm a teapot
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			}
			)
		}
		console.log("URL", url.pathname)
		// OCTRANSPO has a dedicated router.
		if (url.pathname.startsWith('/oct/')) {
			// OCTRANSPO Routes, Separate Router
			return oc_rtr.handle(request,env,ctx);
		} else if (url.pathname === '/update/oc_static' ) {
			
			await oc_static_update.fetch(env,"calendar.txt")
			await oc_static_update.fetch(env,"routes.txt")
			await oc_static_update.fetch(env,"shapes.txt")
			await oc_static_update.fetch(env,"stops.txt")

			return collectJSONResponse({status:200}, 200);
		} else if (url.pathname === '/update/oc_codn' ) {
			await oc_time_update.fetch(env)
			await oc_trips_udt.fetch(env)
			return collectJSONResponse({status:200}, 200);
		}
		return new Response(
			home,
			{ headers: { 'Content-Type': 'text/html' } }
		);
	},
	async scheduled(event, env, ctx) {
		// Write code for updating your API
		switch (event.cron) {
		  // You can set up to three schedules maximum.
		  case "1 0 1 * *":
			// Update Condensed API at 12:01 AM on the first day of the month
			await oc_time_update.fetch(env)
			await oc_trips_udt.fetch(env)
			break;
		  case "1 1 1 * *":
			// Update Other files at 1:01 AM on the first day of the month 
			await oc_static_update.fetch(env,"calendar.txt")
			await oc_static_update.fetch(env,"routes.txt")
			await oc_static_update.fetch(env,"shapes.txt")
			await oc_static_update.fetch(env,"stops.txt")
			break;
		}
		console.log("cron processed");
	  },
	};
