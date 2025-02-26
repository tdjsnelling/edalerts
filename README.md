# edalerts

Create Elite Dangerous commodity market alerts. Get notified when a specific commodity buys or sells above or below a certain value.

<img width="1466" alt="Screenshot 2025-02-26 at 14 26 55" src="https://github.com/user-attachments/assets/abde0245-1a17-4480-8b07-58ef214ebdfe" />

## Deployment

There are 4 components:

1. **Web front-end** – the interface used to create/delete alerts
2. **API** – receives requests from the web interface and saves changes to the database
3. **Market listener** – listents to the EDDN and sends alerts based on incoming market messages
4. **MongoDB** – database

### Web front-end

Can be started from the `site` directory with `yarn build` & `yarn start`

Requires the `NEXT_PUBLIC_API_BASE` environment variable containing the URL on which the API service is reachable, e.g. `http://localhost:3000`.

### API & market listener

Can be started from the `api` directory with `yarn start` & `yarn listen` respectively. There are also Dockerfiles for both services.

Both services require the `MONGO_URL` environment variable.

## Resources

* [Commodity lists](https://github.com/EDCD/FDevIDs)
* [Station list](https://eddb.io/api)
