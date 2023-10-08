# BENJA TRANSIT API3

This API combines GTFS Files for OCtranspo that are needed for the working of the Benja Transit App.

This app only supports the OC TRANSPO API (Found at: https://www.octranspo.com/en/plan-your-trip/travel-tools/developers)

Tools Used
- FTP (Only for upload)
- OC Transpo API
- TurfJS (turf/helper)

## API
The following methods are available for use:
 - `GET /oct/allstops` - Returns all stops in the OC Transpo GTFS File (@ FTP SERVER)
 - `GET /oct/realtime` - Data from OC Transpo's Realtime API, Provided in JSON format
 - `GET oct/shape` - Using data from the GTFS File, this returns the shape of the route (WITHOUT TRIP ID)
 - `GET oct/schedule` - A Static Schedule for a specific Stop ID
 - `GET oct/config` - Theme Information for the OC Transpo API
 - `GET oct/shapebyid` - Get the shape of the route using the shape ID
### OCT/SHAPE

The OC Transpo API dosen't provide information about what trip... This makes it hard to figure out what shape it is currently running. Since routes have different brances (Stitsville / Tunneys Pasture) The shape is different. Using the following paramaters the server is able to figure out what shape it is running. There may be multiple that match the query so it returns as an array.

| Paramater     | Description              | Example           |
| ------------- | -------------------------| ----------------- |
| `route`       | The Route Number         | `61`              | 
| `direction`   | The Direction            | `0`               | 
| `startTime`   | The Start Time (HH:MM)   | `15:03`           |
| All above values are required                                |


## FTP
I have a FTP server that has all of the files updated every month (CRON JOB). 
The project liscense does not cover files uploaded to the FTP server.  If you want to use the FTP server, please open a new issue on github.

## Contributing
If you want to contribute to this project, please open a new issue on github.
