import * as turf from '@turf/helpers'

import gtfs_static from "../helper/gtfs-static"
const zone = "America/Toronto"
export default {
	async fetch(query) {
		const shapeid = query.id

		if (!shapeid) {
			return { res: { error: "No shape ID provided" }, code: 400 }
		}

		const sps = await gtfs_static.octranspo("shapes.txt")
		const fts = []
		const sqs = sps.filter((x) => {
			const dts = x.split(",")
			if (dts[0] === shapeid) {
				return true
			}
		}).map((x) => {
			return [Number(x.split(",")[2]), Number(x.split(",")[1])]
		})
		fts.push(turf.lineString(sqs))
		return { res: turf.featureCollection(fts), code: 200 }
}
};
