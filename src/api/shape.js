import * as turf from '@turf/helpers'
// Using to make lines from cords
import { DateTime } from "luxon";

import gtfs_static from "../helper/gtfs-static"
const zone = "America/Toronto"
export default {
	async fetch(query) {
		const now = DateTime.now().setZone(zone)
		const gtfsdt = Number(now.toFormat('yyyyMMdd'))
		// Trasforming the current date to the format of yyyyMMdd, and converting to a number so I can do math with it and the dates
		const list = await gtfs_static.octranspo("calendar.txt", true)
		function acceptabledate() {
			// Reusable function that returns an array of days that are acceptable
			// I HATE CSV/TXT FILES!!!
			const accarr = []
			// Empty array that I will return
			list.forEach((x) => {
				const dts = x.split(",")
				if (isTodayBetweenDates(Number(dts[8]), Number(dts[9]), dts)) {
					accarr.push(dts[0])
				}
			})
			return accarr
		}
		function isTodayBetweenDates(startDate, endDate, obj) {
			const day = now.weekday
			// Monday is 1, Sunday is 7 This works well with the split line as it matches with the index of the array
			if (startDate === "start_date" || !startDate || !endDate || !obj[day] || !gtfsdt || endDate === "end_date") {
				/*console.log("Inavlid date")*/
				// Use that for debugging. 
				return false
			}
			// Ensure I have valid dates, I Cant send Malformed dates
			const comp = gtfsdt
			// For testing I can change the date above to a specific date.
			// obj[day] corisponds to the array 0 = no service on the day, 1 = service on the day
			return comp === startDate || comp === endDate || (comp > startDate && comp < endDate) && obj[day] === "1"
		}

		const time = query.startTime
		const route = query.route;
		const dirid = query.direction;

		if (!time || !route || !dirid) {
			return { res: { error: "Missing query param", code: 404 }, code: 404 };
		}

		async function ocstatic() {
			const tps = await gtfs_static.octranspo("trips.txt")
			const tms = await gtfs_static.octranspo("stop_times.txt")
			const sps = await gtfs_static.octranspo("shapes.txt")

			const accdays = acceptabledate()
			console.log("Acceptable days:", accdays)

			const ftld = tms.filter((x) => {
				const dts = x.split(",")
				//const accrx = new RegExp(accdays.join("|")).test(dts[0])
				// Remove Acceptable Days function from filtering trips here as the mimified version of the file dosen't provide the shortcut I used.
				if (dts[0]) {
					if (/*accrx && */(dts[1].includes(time) /*|| dts[2].includes(time)*/) && dts[3] === "1") {
						return true
					}
				} else {
					return false
				}
			}).map((x) => {
				// Only return the trip id.
				return x.split(",")[0]
			})
			console.log(ftld)
			// Trips.txt
			const ftldtps = tps.filter((x) => {
				const dts = x.split(",")
				const accrx = new RegExp(accdays.join("|")).test(dts[1])
				if (accrx && ftld.includes(dts[2]) && dts[0] === route && dts[3] === dirid) {
					return true
				}
			}).map((x) => {
				return {
					route: x.split(",")[0],
					service_id: x.split(",")[1],
					trip_id: x.split(",")[2],
					dir: x.split(",")[3],
					shape: x.split(",")[4].replace("\r", ""),
				}
			})
			console.log(ftldtps)
			const fts = []
			ftldtps.forEach((x) => {
				const shapeid = x.shape
				const sqs = sps.filter((y) => {
					const dts = y.split(",")
					if (dts[0] === shapeid) {
						return true
					}
				}).map((y) => {
					return [Number(y.split(",")[2]), Number(y.split(",")[1])]
				})
				fts.push(turf.lineString(sqs, x))
				//console.log(sqs)
			})

			return turf.featureCollection(fts)
		}

		return { res: await ocstatic(), code: 200 }
	}
};
