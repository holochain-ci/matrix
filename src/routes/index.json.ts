export function get({ params }) {
  return {
    body: {
      repos: ['holochain/holochain', 'holochain/blarg']
    }
  }
}
