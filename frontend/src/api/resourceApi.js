import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081'

export async function fetchResources(filters = {}) {
  const response = await axios.get(`${API_BASE_URL}/api/resources`, {
    params: filters,
  })
  return response.data
}

export async function fetchResourceById(resourceId) {
  const response = await axios.get(`${API_BASE_URL}/api/resources/${resourceId}`)
  return response.data
}

export async function createResource(payload) {
  const response = await axios.post(`${API_BASE_URL}/api/resources`, payload)
  return response.data
}

export async function updateResource(resourceId, payload) {
  const response = await axios.put(`${API_BASE_URL}/api/resources/${resourceId}`, payload)
  return response.data
}

export async function deleteResource(resourceId) {
  await axios.delete(`${API_BASE_URL}/api/resources/${resourceId}`)
}

export const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
export const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

export function normalizeResourcePayload(formData) {
  return {
    name: formData.name.trim(),
    type: formData.type,
    capacity: formData.capacity === '' ? null : Number(formData.capacity),
    location: formData.location.trim(),
    status: formData.status,
    availabilityStart: formData.availabilityStart || null,
    availabilityEnd: formData.availabilityEnd || null,
  }
}

export function formatResourceTypeLabel(type) {
  return type.replaceAll('_', ' ')
}

export function formatResourceStatusLabel(status) {
  return status.replaceAll('_', ' ')
}

export function createEmptyResourceForm() {
  return {
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    availabilityStart: '08:00',
    availabilityEnd: '18:00',
  }
}

export function createResourceFormFromResource(resource) {
  return {
    name: resource.name ?? '',
    type: resource.type ?? 'LECTURE_HALL',
    capacity: resource.capacity ?? '',
    location: resource.location ?? '',
    status: resource.status ?? 'ACTIVE',
    availabilityStart: resource.availabilityStart ?? '',
    availabilityEnd: resource.availabilityEnd ?? '',
  }
}

export function isCapacityRequired(type) {
  return type !== 'EQUIPMENT'
}

export function getResourceFilterParams(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null),
  )
}

export async function fetchActiveResources() {
  const response = await axios.get(`${API_BASE_URL}/api/resources`, {
    params: { status: 'ACTIVE' },
  })
  return response.data
}
