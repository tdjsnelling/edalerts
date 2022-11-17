const stations = require('./stations_large.json')
const systems = require('./systems_large.json')

const out = stations.map((station) => {
  const {
    name,
    system_id,
    max_landing_pad_size,
    distance_to_star,
    type,
    is_planetary,
  } = station
  const matchingSystem = systems.find((system) => system.id === system_id) || {}
  return {
    name,
    system_name: matchingSystem.name,
    max_landing_pad_size,
    distance_to_star,
    type,
    is_planetary,
  }
})

console.log(JSON.stringify(out))
