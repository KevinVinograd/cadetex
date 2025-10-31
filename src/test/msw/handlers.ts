import { http, HttpResponse } from 'msw'

type Task = any

export const db = {
  tasks: [] as Task[],
  clients: [
    { id: 'client-1', organizationId: 'org-1', name: 'Cliente 1', address: 'Av 1', city: 'CABA', province: 'BA', phoneNumber: '111' },
    { id: 'client-2', organizationId: 'org-1', name: 'Cliente 2', address: 'Av 2', city: 'CABA', province: 'BA', phoneNumber: '222' },
  ],
  providers: [
    { id: 'prov-1', organizationId: 'org-1', name: 'Proveedor 1', address: 'Dir P1', city: 'CABA', province: 'BA', phoneNumber: '333' },
  ],
  couriers: [
    { id: 'cour-1', organizationId: 'org-1', name: 'Courier 1', phoneNumber: '444' },
  ],
}

// Seed one task
db.tasks.push({
  id: 'task-1',
  organizationId: 'org-1',
  type: 'DELIVER',
  referenceNumber: 'REF-OLD',
  clientId: 'client-1',
  addressOverride: 'Av 1',
  city: 'CABA',
  status: 'PENDING',
  priority: 'NORMAL',
  scheduledDate: '2025-12-31',
  notes: '',
  mbl: '',
  hbl: '',
  freightCert: false,
  foCert: false,
  bunkerCert: false,
  photoRequired: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Seed one courier-confirmed task for finalize flow
db.tasks.push({
  id: 'task-cour-1',
  organizationId: 'org-1',
  type: 'DELIVER',
  referenceNumber: 'REF-COURIER',
  clientId: 'client-1',
  courierId: '00000000-0000-0000-0000-000000000001',
  addressOverride: 'Entrega Courier 100',
  city: 'CABA',
  status: 'CONFIRMED',
  priority: 'NORMAL',
  scheduledDate: '2025-12-31',
  notes: 'Requiere firma',
  mbl: '',
  hbl: '',
  freightCert: false,
  foCert: false,
  bunkerCert: false,
  photoRequired: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const requestLog = {
  createTask: [] as any[],
  updateTask: [] as any[],
  updateStatus: [] as any[],
  deleteTask: [] as any[],
}

export const handlers = [
  // Auth validate
  http.post('http://localhost:8080/auth/validate', async () => {
    return HttpResponse.json({
      valid: true,
      user: {
        id: 'user-1',
        name: 'Org Admin',
        email: 'a@b.com',
        role: 'orgadmin',
        organizationId: 'org-1',
      }
    })
  }),
  // Clients
  http.get('http://localhost:8080/clients', () => HttpResponse.json(db.clients)),
  // Providers
  http.get('http://localhost:8080/providers', () => HttpResponse.json(db.providers)),
  // Couriers
  http.get('http://localhost:8080/couriers', () => HttpResponse.json(db.couriers)),
  // Tasks
  http.get('http://localhost:8080/tasks', () => HttpResponse.json(db.tasks)),
  http.get('http://localhost:8080/tasks/organization/:orgId', ({ params }: { params: { orgId: string } }) => {
    const { orgId } = params
    return HttpResponse.json(db.tasks.filter(t => t.organizationId === orgId))
  }),
  // Filtered tasks (used for unassigned list, etc.)
  http.get('http://localhost:8080/tasks/filtered', ({ request }) => {
    const url = new URL(request.url)
    const unassigned = url.searchParams.get('unassigned') === 'true'
    const statuses = url.searchParams.getAll('status')
    let result = [...db.tasks]
    if (unassigned) {
      result = result.filter(t => !t.courierId || t.courierId === 'unassigned')
    }
    if (statuses.length > 0) {
      result = result.filter(t => statuses.includes(String(t.status)))
    }
    return HttpResponse.json(result)
  }),
  http.get('http://localhost:8080/tasks/courier/:courierId', ({ params }: { params: { courierId: string } }) => {
    const { courierId } = params
    return HttpResponse.json(db.tasks.filter(t => t.courierId === courierId))
  }),
  // Task photos endpoint debe estar antes de GET /tasks/:id para que no capture la ruta /tasks/:id/photos
  http.get('http://localhost:8080/tasks/:id/photos', ({ params }: { params: { id: string } }) => {
    const { id } = params
    const task = db.tasks.find(t => t.id === id)
    if (!task) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json([])
  }),
  http.get('http://localhost:8080/tasks/:id', ({ params }: { params: { id: string } }) => {
    const { id } = params
    const task = db.tasks.find(t => t.id === id)
    return task ? HttpResponse.json(task) : HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
  http.post('http://localhost:8080/tasks', async ({ request }: { request: Request }) => {
    const body = await request.json() as any
    requestLog.createTask.push(body)
    const newTask = {
      id: `task-${Date.now()}`,
      organizationId: body.organizationId || 'org-1',
      type: body.type || 'DELIVER',
      referenceNumber: body.referenceNumber,
      clientId: body.clientId,
      providerId: body.providerId,
      addressOverride: body.addressOverride,
      city: body.city,
      status: body.status || 'PENDING',
      priority: body.priority || 'NORMAL',
      scheduledDate: body.scheduledDate,
      notes: body.notes,
      mbl: body.mbl,
      hbl: body.hbl,
      freightCert: Boolean(body.freightCert),
      foCert: Boolean(body.foCert),
      bunkerCert: Boolean(body.bunkerCert),
      photoRequired: Boolean(body.photoRequired),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.tasks.push(newTask)
    return HttpResponse.json(newTask, { status: 201 })
  }),
  http.delete('http://localhost:8080/tasks/:id', ({ params }: { params: { id: string } }) => {
    const { id } = params
    requestLog.deleteTask.push(id)
    const idx = db.tasks.findIndex(t => t.id === id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    db.tasks.splice(idx, 1)
    return HttpResponse.json({ ok: true })
  }),
  http.put('http://localhost:8080/tasks/:id', async ({ params, request }: { params: { id: string }, request: Request }) => {
    const { id } = params
    const body = await request.json() as any
    requestLog.updateTask.push(body)
    const idx = db.tasks.findIndex(t => t.id === id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const updated = {
      ...db.tasks[idx],
      ...body,
      freightCert: body.freightCert ?? db.tasks[idx].freightCert,
      foCert: body.foCert ?? db.tasks[idx].foCert,
      bunkerCert: body.bunkerCert ?? db.tasks[idx].bunkerCert,
      updatedAt: new Date().toISOString(),
    }
    db.tasks[idx] = updated
    return HttpResponse.json(updated)
  }),
  http.patch('http://localhost:8080/tasks/:id/status', async ({ params, request }: { params: { id: string }, request: Request }) => {
    const { id } = params
    const body = await request.json() as any
    requestLog.updateStatus.push({ id, status: body.status })
    const task = db.tasks.find(t => t.id === id)
    if (!task) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    task.status = body.status
    task.updatedAt = new Date().toISOString()
    return HttpResponse.json(task)
  }),
  // Upload task photo (receipt or additional)
  http.post('http://localhost:8080/tasks/:id/photo', async ({ params }: { params: { id: string } }) => {
    const { id } = params
    const task = db.tasks.find(t => t.id === id)
    if (!task) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ photoUrl: `http://localhost:8080/mock-photos/${id}/${Date.now()}.jpg` })
  }),
  // Unassigned tasks for courier
  http.get('http://localhost:8080/tasks/unassigned', () => {
    return HttpResponse.json(db.tasks.filter(t => !t.courierId || t.courierId === 'unassigned'))
  }),
]


