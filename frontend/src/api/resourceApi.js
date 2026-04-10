import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081'

export async function fetchResources() {
  const response = await axios.get(`${API_BASE_URL}/api/resources`)
  return response.data
}
