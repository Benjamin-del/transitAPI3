import { Router } from 'itty-router';

const router = Router();
const config = require("../config.json")
async function getfile(file) {
    const response = await fetch(config.GTFS_SVR + file)
    return await response.text()
}
router.get('/gtfs/:file', async ({ params }) => {
    console.log("ROUTER (GTFS): Fetching file: " + params.file)
	if (config.ACC_FILES.includes(params.file)) {
    return new Response(await getfile(params.file), {headers: {"content-type": "text/plain;charset=UTF-8"}})
	} else {
		return new Response("File not found", {status: 404})
	}
});

router.all('*', () => new Response('Not found', { status: 404 }));

export default router;
