import * as turf from '@turf/helpers'
import gtfs_static from "../helper/gtfs-static"
export default {
	async fetch() {
		const list = await gtfs_static.octranspo("stops.txt")
		const stps = []
		for (var i = 0; i < list.length; i++) {
			const dts = list[i].split(",")
			if (dts[0] === "stop_id" || dts[0] === "") {
				continue
			}
			const pt = turf.point([Number(dts[4]), Number(dts[5])], {id: dts[0], code: dts[1], name: dts[2].replace(/\\/g,"\\\\")})
			stps.push(pt)
		}
		return {res: stps, code: 200}
	}
};
