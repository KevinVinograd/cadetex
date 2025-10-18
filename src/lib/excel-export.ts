import * as XLSX from 'xlsx'
import type { Task } from './types'

export function exportTasksToExcel(tasks: Task[], filename: string = 'tareas-completadas.xlsx') {
  // Filtrar solo tareas completadas
  const completedTasks = tasks.filter(task => task.status === 'finalizada')
  
  // Preparar los datos para Excel
  const excelData = completedTasks.map(task => ({
    'Fecha de Creación': new Date(task.createdAt).toLocaleDateString('es-ES'),
    'Fecha de Finalización': new Date(task.updatedAt).toLocaleDateString('es-ES'),
    'Cliente': task.clientName,
    'Tipo de Tarea': task.type,
    'Estado Final': 'Finalizada',
    'Cadete Asignado': task.courierName || 'No asignado',
    'Referencia BL': task.referenceBL,
    'MBL': task.mbl || '',
    'HBL': task.hbl || '',
    'Certificado de Flete': task.freightCertificate || '',
    'Certificación de FO': task.foCertificate || '',
    'Certificación de Búnker': task.bunkerCertificate || '',
    'Dirección de Recogida': task.pickupAddress,
    'Dirección de Entrega': task.deliveryAddress,
    'Fecha Programada': new Date(task.scheduledDate).toLocaleDateString('es-ES'),
    'Hora Programada': task.scheduledTime || '',
    'Prioridad': task.priority,
    'Observaciones': task.notes || ''
  }))

  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new()
  
  // Crear la hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(excelData)
  
  // Ajustar el ancho de las columnas
  const colWidths = [
    { wch: 12 }, // Fecha de Creación
    { wch: 12 }, // Fecha de Finalización
    { wch: 20 }, // Cliente
    { wch: 15 }, // Tipo de Tarea
    { wch: 12 }, // Estado Final
    { wch: 20 }, // Cadete Asignado
    { wch: 15 }, // Referencia BL
    { wch: 15 }, // MBL
    { wch: 15 }, // HBL
    { wch: 18 }, // Certificado de Flete
    { wch: 15 }, // Certificación de FO
    { wch: 18 }, // Certificación de Búnker
    { wch: 30 }, // Dirección de Recogida
    { wch: 30 }, // Dirección de Entrega
    { wch: 12 }, // Fecha Programada
    { wch: 12 }, // Hora Programada
    { wch: 10 }, // Prioridad
    { wch: 40 }  // Observaciones
  ]
  
  ws['!cols'] = colWidths
  
  // Agregar la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Tareas Completadas')
  
  // Descargar el archivo
  XLSX.writeFile(wb, filename)
}

export function exportAllTasksToExcel(tasks: Task[], filename: string = 'todas-las-tareas.xlsx') {
  // Preparar los datos para Excel
  const excelData = tasks.map(task => ({
    'Fecha de Creación': new Date(task.createdAt).toLocaleDateString('es-ES'),
    'Fecha de Actualización': new Date(task.updatedAt).toLocaleDateString('es-ES'),
    'Cliente': task.clientName,
    'Tipo de Tarea': task.type,
    'Estado': task.status,
    'Cadete Asignado': task.courierName || 'No asignado',
    'Referencia BL': task.referenceBL,
    'MBL': task.mbl || '',
    'HBL': task.hbl || '',
    'Certificado de Flete': task.freightCertificate || '',
    'Certificación de FO': task.foCertificate || '',
    'Certificación de Búnker': task.bunkerCertificate || '',
    'Dirección de Recogida': task.pickupAddress,
    'Dirección de Entrega': task.deliveryAddress,
    'Fecha Programada': new Date(task.scheduledDate).toLocaleDateString('es-ES'),
    'Hora Programada': task.scheduledTime || '',
    'Prioridad': task.priority,
    'Observaciones': task.notes || ''
  }))

  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new()
  
  // Crear la hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(excelData)
  
  // Ajustar el ancho de las columnas
  const colWidths = [
    { wch: 12 }, // Fecha de Creación
    { wch: 12 }, // Fecha de Actualización
    { wch: 20 }, // Cliente
    { wch: 15 }, // Tipo de Tarea
    { wch: 15 }, // Estado
    { wch: 20 }, // Cadete Asignado
    { wch: 15 }, // Referencia BL
    { wch: 15 }, // MBL
    { wch: 15 }, // HBL
    { wch: 18 }, // Certificado de Flete
    { wch: 15 }, // Certificación de FO
    { wch: 18 }, // Certificación de Búnker
    { wch: 30 }, // Dirección de Recogida
    { wch: 30 }, // Dirección de Entrega
    { wch: 12 }, // Fecha Programada
    { wch: 12 }, // Hora Programada
    { wch: 10 }, // Prioridad
    { wch: 40 }  // Observaciones
  ]
  
  ws['!cols'] = colWidths
  
  // Agregar la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Todas las Tareas')
  
  // Descargar el archivo
  XLSX.writeFile(wb, filename)
}
