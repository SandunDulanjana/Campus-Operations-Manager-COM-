import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081'

export async function uploadTimetable(file, user) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE_URL}/api/timetable/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function fetchWeeklyTimetable(weekStart, user) {
  const response = await axios.get(`${API_BASE_URL}/api/timetable/weekly`, {
    params: { weekStart },
  })
  return response.data
}
