# Matrix

Matrix of project with health metrics and stats   

## Development server

```
mix deps.get && mix run --no-halt
```

Then visit (eg) <http://localhost:4001/ipfs>

## Docker Compose

### Fetch dependencies

```
docker-compose run --rm www mix deps.get
```

*All mix tasks for a service can be run this way, such as tests for a single service.*

### Run all services

```
docker-compose up
```

* Use `-d` to run in the background
* Use `--build` to ensure images are rebuilt
* Use `docker-compose down` to stop all services
