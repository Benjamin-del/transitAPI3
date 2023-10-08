import gtfs_static from "./gtfs-static"

export default {
    async octranspo(routeId) {
        console.log("HELPER (ROUTES): Fetching OC Transpo route data for route #" + routeId)
        const oc_routes = await gtfs_static.octranspo("routes.txt")
        return oc_routes.filter((x) => {
            return x.split(",")[0] === (routeId + "-349")
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
}