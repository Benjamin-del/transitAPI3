# BENJA TRANSIT API3

![Last GTFS Update](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FBenjamin-del%2FTransitDB3%2Fmain%2Fupdate.json&query=update&label=Last%20GTFS%20Update&color=red) 

This API uses GTFS and the wonky OC Transpo API to supply the backend for Benja Transit.

This app supports the OC TRANSPO API (Found at: https://www.octranspo.com/en/plan-your-trip/travel-tools/developers)

Tools Used
- OC Transpo API
- TurfJS (turf/helper)
- Luxon

## API
The following methods are available for use:
 - `GET /api/allstops` - Returns all stops in the OC Transpo GTFS File (@ FTP SERVER)
 - `GET /api/realtime` - Data from OC Transpo's Realtime API, Provided in JSON format
 - `GET api/shape` - Using data from the GTFS File, this returns the shape of the route (WITHOUT TRIP ID, See below for full documentation)
 - `GET api/schedule` - A Static Schedule for a specific Stop ID
 - `GET api/config` - Theme Information for the OC Transpo API
 - `GET api/shapebyid` - Get the shape of the route using the shape ID

## GTFS API
This acts as a midleware for the GTFS server. All it does is return it. The following methods are available for use:
 - `GET gtfs/trips.txt` - Returns the entire stop_times.txt GTFS file
 - `GET gtfs/stop_times.txt` - Returns the entire stops.txt GTFS file
 - `GET gtfs/calendar.txt` - Returns the entire calendar.txt GTFS file
 - `GET gtfs/routes.txt` - Returns the entire routes.txt GTFS file
 - `GET gtfs/shapes.txt` - Returns the entire shapes.txt GTFS file
 - `GET gtfs/stops.txt` - Returns the entire stops.txt GTFS file

### OCT/SHAPE

The OC Transpo API dosen't provide information about what trip... This makes it hard to figure out what shape it is currently running. Since routes have different brances (Stitsville / Tunneys Pasture) The shape is different. Using the following paramaters the server is able to figure out what shape it is running. There may be multiple that match the query so it returns as an array.

| Paramater     | Description              | Example           |
| ------------- | -------------------------| ----------------- |
| `route`       | The Route Number         | `61`              | 
| `direction`   | The Direction            | `0`               | 
| `startTime`   | The Start Time (HH:MM)   | `15:03`           |
| All above values are required                                |


## Static GTFS
For OC Transpo, I have deflated some GTFS files, they are available at a seperate Repo (Available at: https://benjamin-del.github.io/TransitDB3). You can use this repo with your worker but I would suggest forking that repo and using your own version.


## Installation
This is designed to run on a Cloudflare Worker. It could be ported over to a express server or other serverless components but that is not supported.

1. Fork the project and create a `.dev.vars` file in the root directory. I would sugest using wrangler. It should look like this:


    ```
    # OCTRANSPO API
    OCTRANSPO_API_KEY="0000111122223333444"
    OCTRANSPO_APP_ID="1234566"
    ```
    (Fill in the values)
    
2. Install Coudlflare Wrangler. You can find the instructions here: https://developers.cloudflare.com/workers/cli-wrangler/install-update

3. Configure your server where you get the GTFS files from. The configuration is found at `src/helper/gtfs-static.js`, line `6`. The current server will not work.

4. run `npm run start` to test the server locally. The server will usually run at `http://localhost:8787`.

5. run `npm run deploy` to deploy the server to cloudflare. The server is ready at  `https://yourpoject.yourname.workers.dev`.

### Configuration
The file `./config.json` contains the configuration for the server. The following options are available:

| Option            | Description                   | Example                                                                       |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `GTFS_SVR`        | The URL to the GTFS Server    | `https://benjamin-del.github.io/TransitDB3`                                   |
| `ACC_FILES`       | The files to accept (Array)   | `['stops.txt', 'stop_times.txt', 'calendar.txt', 'routes.txt', 'shapes.txt']` |

## Contributing
If you want to contribute to this project, please open a new issue on github.
