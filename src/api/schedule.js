import { DateTime } from "luxon";

import helper_stops from "../helper/stops"
import gtfs_static from "../helper/gtfs-static"
// Using to parse dates and to ensure I don't have to deal with timezones
const zone = "America/Toronto"

export default {
    async fetch(query) {
        const stopid = query.stop
        if (!stopid) {
            return { res: { error: "Missing query param", code: 404 }, code: 404 };
        }

        const now = DateTime.now().setZone(zone)
        const gtfsdt = query.date || Number(now.toFormat('yyyyMMdd'))
        const gtfshr = query.time || Number(now.toFormat('HHmmss'))

        const list = await gtfs_static.octranspo("calendar.txt")

        function acceptabledate() {
            // Reusable function that returns an array of days that are acceptable
            // I HATE CSV/TXT FILES!!!
            const accarr = []
            console.log(list)
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
        // Load all of the files
        const tms = await gtfs_static.octranspo("stop_times.txt")
        const tps = await gtfs_static.octranspo("trips.txt")
        const accdays = acceptabledate()
        const accrx = new RegExp(accdays.join("|"))
        const ftldtms = tms.filter((x) => {
            const dts = x.split(",")
            if (dts[2] === stopid) {
                const arrv = Number(dts[1].replace(/:/g, ""))
                if (arrv > gtfshr) {
                    return true
                }
            }
        }).map(x => {
            return { id: x.split(",")[0], arrv: x.split(",")[1] }
        })
        const ftldtps = []
        ftldtms.forEach((x) => {
            tps.filter((y) => {
                const dts = y.split(",")
                if (dts[2] === x.id && accrx.test(dts[1])) {
                    ftldtps.push({
                        route: dts[0],
                        service_id: dts[1],
                        arrv: x.arrv,
                        trip_id: dts[2],
                        dir: dts[3],
                        shape: dts[4].replace("\r", ""),
                    })
                }
            })
        })
        return {
            res: {
                query: {
                    time: gtfshr,
                    date: gtfsdt,
                    stop: stopid,
                    _accdays: accdays
                },
                schedule: ftldtps,
                stop: await helper_stops.octranspo(stopid)
            }, 
            code: 200
        }
    }
}