import { Router } from 'itty-router';
import stoplist from './api/list';
import realtime from './api/realtime';
import context from './api/context';
import shapebyid from './api/shape';

// now let's create a router (note the lack of "new")
const router = Router();
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

// All of the stops in the city!
router.get('/api/allstops', async () => {
	const stlst = await stoplist.fetch()
	return collectJSONResponse(stlst.res,stlst.code)
});
// Get a specific stop (GTFS code)
router.get("/api/realtime", async (request) => {
	const ftch = await realtime.fetch(request.query);
	return collectJSONResponse(ftch.res, ftch.code)
})
// Get a specific shape)
// OCTRANSPO API dosen't tell me what trip ID the bus is on so you have to use start time, route# and directionId (1,0)
router.get("/api/context", async (request) => {
	const ftch = await context.fetch(request.query);
	return collectJSONResponse(ftch.res, ftch.code)
})
// Get Static Stop Schedule
router.get("/api/shape", async (request) => {
	const ftch = await shapebyid.fetch(request.query);
	return collectJSONResponse(ftch.res, ftch.code)
})
router.get("/api/config", () => {
	const config = {
		theme: {
			primary: "#ED1B2E",
			secondary: "#FFFFFF",
		}
	}
	return collectJSONResponse(config, 200)
})

// 404 for everything else
router.all('*', () => collectJSONResponse({error: "404 - Not found", ag: "OCTRANSPO"}, 404));

export default router;
