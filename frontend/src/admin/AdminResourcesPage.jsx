import { useEffect, useMemo, useState } from 'react'
import { AlertCircleIcon, BoxesIcon, FilterIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Resources', value: resources.length, icon: BoxesIcon },
          { label: 'Active Filters', value: [filters.type, filters.minCapacity, filters.location, filters.status].filter(Boolean).length, icon: FilterIcon },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="md:col-span-1">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl font-semibold tracking-tight">{stat.value}</CardTitle>
                </div>
                <div className="rounded-lg border bg-muted p-2 text-muted-foreground">
                  <Icon />
                </div>
              </CardHeader>
            </Card>
          )
        })}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b">
            <div className="flex flex-col gap-1">
              <CardTitle>Resource Catalogue</CardTitle>
              <CardDescription>Inventory, availability, status, location.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFilters} disabled={loading}>Reset filters</Button>
              <Button onClick={openCreateForm} disabled={loading}>
                <PlusIcon data-icon="inline-start" />
                Add Resource
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {errorMessage ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircleIcon />
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
            {successMessage ? (
              <Alert className="mb-4">
                <PlusIcon />
                <AlertTitle>Updated</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            <form className="grid gap-4 rounded-xl border bg-muted/30 p-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={applyFilters}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.type || '__all__'} onValueChange={(value) => updateFilter('type', value === '__all__' ? '' : value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__all__">All types</SelectItem>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{formatResourceTypeLabel(type)}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status || '__all__'} onValueChange={(value) => updateFilter('status', value === '__all__' ? '' : value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__all__">All statuses</SelectItem>
                      {RESOURCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>{formatResourceStatusLabel(status)}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="resource-min-capacity">Min Capacity</label>
                <Input id="resource-min-capacity" type="number" min="1" value={filters.minCapacity} onChange={(e) => updateFilter('minCapacity', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="resource-location">Location</label>
                <Input id="resource-location" value={filters.location} onChange={(e) => updateFilter('location', e.target.value)} />
              </div>

              <div className="flex items-end">
                <Button className="w-full" type="submit" disabled={loading}>
                  Filter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Resource Catalogue</CardTitle>
          <CardDescription>Review and update inventory records.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{formatResourceTypeLabel(resource.type)}</TableCell>
                    <TableCell>{resource.capacity ?? '-'}</TableCell>
                    <TableCell>{resource.location}</TableCell>
                    <TableCell><Badge variant="outline">{formatResourceStatusLabel(resource.status)}</Badge></TableCell>
                    <TableCell>
                      {resource.availabilityStart && resource.availabilityEnd
                        ? `${resource.availabilityStart} - ${resource.availabilityEnd}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditForm(resource)} disabled={loading}>
                          <PencilIcon data-icon="inline-start" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeResource(resource.id)} disabled={loading}>
                          <Trash2Icon data-icon="inline-start" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!resources.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No resources found for selected filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeForm(); else setShowForm(true) }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingResourceId === null ? 'Create Resource' : 'Update Resource'}</DialogTitle>
            <DialogDescription>Manage type, status, capacity, location, availability window.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={submitResource}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium" htmlFor="resource-name">Name</label>
                <Input id="resource-name" required value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{formatResourceTypeLabel(type)}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {RESOURCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>{formatResourceStatusLabel(status)}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="resource-capacity">Capacity</label>
                <Input
                  id="resource-capacity"
                  type="number"
                  min={capacityRequired ? '1' : '0'}
                  required={capacityRequired}
                  disabled={!capacityRequired}
                  value={capacityRequired ? formData.capacity : ''}
                  onChange={(e) => updateField('capacity', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="resource-location-field">Location</label>
                <Input id="resource-location-field" required value={formData.location} onChange={(e) => updateField('location', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="resource-start">Availability Start</label>
                <Input id="resource-start" type="time" value={formData.availabilityStart} onChange={(e) => updateField('availabilityStart', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="resource-end">Availability End</label>
                <Input id="resource-end" type="time" value={formData.availabilityEnd} onChange={(e) => updateField('availabilityEnd', e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : editingResourceId === null ? 'Create Resource' : 'Update Resource'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default AdminResourcesPage
