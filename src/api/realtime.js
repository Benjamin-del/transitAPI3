import { DateTime } from "luxon";
// Using to parse dates and to ensure I don't have to deal with timezones
import * as turf from '@turf/helpers'
// Using to Collect Points, Makes my life easier
const zone = "America/Toronto"
// Ottawa is using Toronto's timezone, so I'm using that as the default. I could also use NYC's timezone.
import route_helper from "../helper/routes"
import gtft_static from "../helper/gtfs-static"
// This fetched our file and returns it.
export default {
	async fetch(query,env) {
		console.log(query)
		const stopid = query.stop
		
		async function code2id(code) {
			// Transforms GTFS stop ID to OCTranspo stop ID (used in 560-560)
			const list = await gtft_static.octranspo("stops.txt", true)
			console.log(list)
			for (var i = 0; i < list.length; i++) {
				const dts = list[i].split(",")
				if (dts[0] === code) {
					return {
						id: dts[0],
						code: dts[1],
						name: dts[2].replace(/\\/g, "\\\\"),
						lat: dts[4],
						lon: dts[5]
					}
					// More information can be sent to the API
				}
			}
			return null
		}

		if (!stopid) {
			return { res: { error: "Missing query param", code: 404 }, code: 404 };
		}
		function arrayobj(objorarr) {
			console.log("data-1", objorarr)
			// OCtranspo API is weird, sometimes it returns an array, sometimes it returns an object???
			if (JSON.stringify(objorarr).split("")[0] === "{") {
				//Cheating, but typeof returns object for both arrays and objects
				return [objorarr]
				// It's an object, so I'm going to make it an array
			} else {
				return objorarr
				// Yay! It's an array!
			}
			// This is a very hacky way of doing it, but it works.
			// I took this part straight from v2 of the API. 
		}
		const gps_arr = []
		const tm_arr = []
		async function ocrealtime() {
			const stp_inf = await code2id(stopid)
			const data = await fetch("https://api.octranspo1.com/v2.0/GetNextTripsForStopAllRoutes?appID=87c88940&apiKey=6ef18ce1eff8c5741812b6814766b7e0&format=JSON&stopNo=" + stp_inf.code)
			
			console.log("Loading code:" + code2id(stopid).code)

			const response = await data.text()
			if (response.includes("<h4>")) {
				console.error("OC Transpo API Error")
				return { error: "OC Transpo API Error" }
			} else {
				// Why did you send JSON as HTML???
				const json = JSON.parse(response)
				const rt = json.GetRouteSummaryForStopResult.Routes.Route
				console.log("rt", rt)
				const route = arrayobj(rt)
				console.log(route)
				for (var i = 0; i < route.length; i++) {
					await geoJsonCollect(route[i])
				}
				return {time: tm_arr, gps: turf.featureCollection(gps_arr)};
			}
		}
		async function geoJsonCollect(obj) {
			//console.log("data-2", obj.Trips)
			// Sometimes it returns an array, sometimes it returns an object. This makes sure it is an Object
			// I will return this array 

			const trips = arrayobj(obj.Trips)
			for (var i = 0; i < trips.length; i++) {
				if (trips[i].Longitude) {
					console.log("trips", trips[i])
					const dt = turf.point([Number(trips[i].Longitude), Number(trips[i].Latitude)], {
						no: obj.RouteNo,
						heading: obj.RouteHeading,
						destination: trips[i].TripDestination,
						time: {
							mins: trips[i].AdjustedScheduleTime,
							hhmm: DateTime.now().setZone(zone).plus({ minutes: trips[i].AdjustedScheduleTime }).toFormat("HH:mm"),
							adjustedTime: trips[i].AdjustedScheduleTime,
							adjustmentAge: trips[i].AdjustmentAge,
							tripStartTime: trips[i].TripStartTime,
						},
						direction: obj.DirectionID,
						lastTrip: trips[i].LastTripOfSchedule,
						//gtfs: await route_helper.octranspo(obj.RouteNo),
					})
					gps_arr.push(dt)
				} else {
					console.log(trips[i])
					console.log("NO DATA!")
				}
				// Push to array of all trips (GPS or not)
				tm_arr.push({
					no: obj.RouteNo,
					heading: obj.RouteHeading,
					destination: trips[i].TripDestination,
					time: {
						mins: trips[i].AdjustedScheduleTime,
						hhmm: DateTime.now().setZone(zone).plus({ minutes: trips[i].AdjustedScheduleTime }).toFormat("HH:mm"),
						adjustedTime: trips[i].AdjustedScheduleTime,
						adjustmentAge: trips[i].AdjustmentAge,
						tripStartTime: trips[i].TripStartTime,
					},
					direction: obj.DirectionID,
					lastTrip: trips[i].LastTripOfSchedule,
					gtfs: await route_helper.octranspo(obj.RouteNo),
				})
			}
			return
		}

		// STATIC MOVED TO SHAPE
		return {res: await ocrealtime(), code: 200}
	}
};
