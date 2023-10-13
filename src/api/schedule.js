import { DateTime } from "luxon";

import helper_stops from "../helper/stops"
import gtfs_static from "../helper/gtfs-static"

// Using to parse dates and to ensure I don't have to deal with timezones
const zone = "America/Toronto"

export default {
    async fetch(query) {
        const stopid = query.id
        if (!stopid) {
            return { res: { error: "No ID provided", code: 400 }, code: 400 };
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
        //const rts = await gtfs_static.octranspo("routes.txt")

        async function routes(routeId) {
        
            return rts.filter((x) => {
                console
                return x.split(",")[0] === routeId || x.split(",")[0].split("-")[0] === routeId
            }).map((x) => {
                const dts = x.split(",")
                return {
                    route_id: dts[0].split("-")[0],
                    route_short_name: dts[2],
                    route_long_name: dts[3].replace(/\"/g, ""),
                    route_type: dts[5],
                    route_color: ("#" + dts[6]),
                    route_text_color: ("#" + dts[7]).replace("\r", ""),
                }
            })[0]
        }

        //const accdays = acceptabledate()
        //const accrx = new RegExp(accdays.join("|"))
        const ftldtms = tms.filter((x) => {
            const dts = x.split(",")
            if (dts[2] === stopid) {
                /*const arrv = Number(dts[1].replace(/:/g, ""))
                if (arrv > gtfshr) {
                    return true
                }*/
                return true
            }
        }).map(x => {
            return { id: x.split(",")[0], arrv: x.split(",")[1] }
        })
        const ftldtps = []
        ftldtms.forEach(async (x) => {
            tps.filter(async (y) => {
                const dts = y.split(",")
                if (dts[2] === x.id /*&& accrx.test(dts[1])*/) {
                    ftldtps.push({
                        route: dts[0],
                        service_id: dts[1],
                        arrv: x.arrv,
                        trip_id: dts[2],
                        dir: dts[3],
                        shape: dts[4].replace("\r", ""),
                        //gtfs: await routes(dts[0])
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