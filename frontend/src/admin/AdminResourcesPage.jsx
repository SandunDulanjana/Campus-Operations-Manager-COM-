import { useEffect, useMemo, useState } from 'react'
import ActionButton from '../components/ui/ActionButton'
import StatusBanner from '../components/ui/StatusBanner'
import {
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  createEmptyResourceForm,
  createResourceFormFromResource,
  createResource,
  deleteResource,
  fetchResources,
  formatResourceStatusLabel,
  formatResourceTypeLabel,
  getResourceFilterParams,
  isCapacityRequired,
  normalizeResourcePayload,
  updateResource,
} from '../api/resourceApi'

const DEFAULT_FILTERS = {
  type: '',
  minCapacity: '',
  location: '',
  status: '',
}

function AdminResourcesPage() {
  const [resources, setResources] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [formData, setFormData] = useState(createEmptyResourceForm)
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    void loadResources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount only

  const capacityRequired = useMemo(() => isCapacityRequired(formData.type), [formData.type])

  async function loadResources(nextFilters = filters) {
    setLoading(true)
    try {
      const data = await fetchResources(getResourceFilterParams(nextFilters))
      setResources(data)
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  function clearMessages() {
    setErrorMessage('')
    setSuccessMessage('')
  }

  function openCreateForm() {
    clearMessages()
    setEditingResourceId(null)
    setFormData(createEmptyResourceForm())
    setShowForm(true)
  }

  function openEditForm(resource) {
    clearMessages()
    setEditingResourceId(resource.id)
    setFormData(createResourceFormFromResource(resource))
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingResourceId(null)
    setFormData(createEmptyResourceForm())
  }

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function applyFilters(event) {
    event.preventDefault()
    clearMessages()
    await loadResources(filters)
  }

  async function resetFilters() {
    clearMessages()
    setFilters(DEFAULT_FILTERS)
    await loadResources(DEFAULT_FILTERS)
  }

  async function submitResource(event) {
    event.preventDefault()
    clearMessages()
    setLoading(true)

    try {
      const payload = normalizeResourcePayload({
        ...formData,
        capacity: capacityRequired ? formData.capacity : '',
      })

      if (editingResourceId === null) {
        await createResource(payload)
        setSuccessMessage('Resource created successfully')
      } else {
        await updateResource(editingResourceId, payload)
        setSuccessMessage('Resource updated successfully')
      }

      closeForm()
      await loadResources()
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to save resource')
    } finally {
      setLoading(false)
    }
  }

  async function removeResource(resourceId) {
    clearMessages()
    setLoading(true)
    try {
      await deleteResource(resourceId)
      setSuccessMessage('Resource deleted successfully')
      await loadResources()
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to delete resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-resources-page">
      <div className="admin-section-card">
        <div className="panel-header">
          <h1>Resources Management</h1>
          <p>Manage campus resource inventory, status, capacity, and availability windows.</p>
        </div>

        <StatusBanner type="error" message={errorMessage} />
        <StatusBanner type="success" message={successMessage} />

        <form className="admin-filter-row admin-resource-filter-row" onSubmit={applyFilters}>
          <label>
            Type
            <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
              <option value="">All types</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatResourceTypeLabel(type)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
              <option value="">All statuses</option>
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatResourceStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Min Capacity
            <input
              type="number"
              min="1"
              value={filters.minCapacity}
              onChange={(event) => updateFilter('minCapacity', event.target.value)}
            />
          </label>

          <label>
            Location
            <input value={filters.location} onChange={(event) => updateFilter('location', event.target.value)} />
          </label>

          <ActionButton kind="primary" type="submit" disabled={loading}>
            Filter
          </ActionButton>
          <ActionButton kind="ghost" onClick={resetFilters} disabled={loading}>
            Reset
          </ActionButton>
          <ActionButton kind="approve" onClick={openCreateForm} disabled={loading}>
            Add Resource
          </ActionButton>
        </form>
      </div>

      <div className="table-panel">
        <h2>Resource Catalogue</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.name}</td>
                  <td>{formatResourceTypeLabel(resource.type)}</td>
                  <td>{resource.capacity ?? '-'}</td>
                  <td>{resource.location}</td>
                  <td>{formatResourceStatusLabel(resource.status)}</td>
                  <td>
                    {resource.availabilityStart && resource.availabilityEnd
                      ? `${resource.availabilityStart} - ${resource.availabilityEnd}`
                      : '-'}
                  </td>
                  <td className="resource-actions-cell">
                    <ActionButton kind="ghost" onClick={() => openEditForm(resource)} disabled={loading}>
                      Edit
                    </ActionButton>
                    <ActionButton kind="danger" onClick={() => removeResource(resource.id)} disabled={loading}>
                      Delete
                    </ActionButton>
                  </td>
                </tr>
              ))}
              {resources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="resource-empty-state">
                    No resources found for the selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showForm ? (
        <div className="modal-backdrop" role="presentation" onClick={closeForm}>
          <div className="modal-window" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingResourceId === null ? 'Create Resource' : 'Update Resource'}</h2>
              <ActionButton kind="ghost" onClick={closeForm}>
                Close
              </ActionButton>
            </div>

            <form className="booking-form" onSubmit={submitResource}>
              <label>
                Name
                <input
                  required
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                />
              </label>

              <div className="resource-form-grid">
                <label>
                  Type
                  <select value={formData.type} onChange={(event) => updateField('type', event.target.value)}>
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {formatResourceTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Status
                  <select value={formData.status} onChange={(event) => updateField('status', event.target.value)}>
                    {RESOURCE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatResourceStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="resource-form-grid">
                <label>
                  Capacity
                  <input
                    type="number"
                    min={capacityRequired ? '1' : '0'}
                    required={capacityRequired}
                    disabled={!capacityRequired}
                    value={capacityRequired ? formData.capacity : ''}
                    onChange={(event) => updateField('capacity', event.target.value)}
                  />
                </label>

                <label>
                  Location
                  <input
                    required
                    value={formData.location}
                    onChange={(event) => updateField('location', event.target.value)}
                  />
                </label>
              </div>

              <div className="resource-form-grid">
                <label>
                  Availability Start
                  <input
                    type="time"
                    value={formData.availabilityStart}
                    onChange={(event) => updateField('availabilityStart', event.target.value)}
                  />
                </label>

                <label>
                  Availability End
                  <input
                    type="time"
                    value={formData.availabilityEnd}
                    onChange={(event) => updateField('availabilityEnd', event.target.value)}
                  />
                </label>
              </div>

              <ActionButton kind="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingResourceId === null ? 'Create Resource' : 'Update Resource'}
              </ActionButton>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdminResourcesPage
