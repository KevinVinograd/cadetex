// Sistema de traducciones simple
// Para agregar soporte multi-idioma más adelante, se puede expandir

export type Locale = 'es'

export const translations = {
  es: {
    // Courier Tasks Page
    courierTasks: {
      title: "Tareas",
      assignedTasks: "Mis Tareas",
      unassignedTasks: "Sin Asignar",
      noTasks: "No hay tareas asignadas",
      noTasksDescription: "No tienes tareas asignadas en este momento.",
      noUnassignedTasks: "No hay tareas disponibles",
      noUnassignedTasksDescription: "No hay tareas sin asignar en este momento.",
      loadingTasks: "Cargando tareas...",
      loadingUnassigned: "Cargando tareas disponibles...",
      statusSummary: {
        pending: "Pendientes",
        completed: "Finalizadas",
        confirmed: "Confirmadas",
        unassigned: "Sin Asignar",
        urgent: "Urgentes",
        deliveries: "Entregas"
      },
      notification: {
        title: "Tienes tareas sin asignar",
        description: "Hay tareas disponibles que aún no están asignadas. ¿Quieres asignarlas ahora?",
        buttonText: "Ver Tareas"
      },
      searchPlaceholder: "Buscar tareas...",
      filters: {
        status: "Estado",
        statusAll: "Todos",
        statusPending: "Pendiente",
        statusConfirmed: "Confirmado",
        statusCompleted: "Completado",
        priority: "Prioridad",
        priorityAll: "Todas",
        priorityNormal: "Normal",
        priorityUrgent: "Urgente",
        clear: "Limpiar"
      },
      statusLabels: {
        pending: "Pendiente",
        pendingConfirmation: "Pendiente Confirmación",
        confirmed: "Confirmado",
        completed: "Completado",
        cancelled: "Cancelado"
      },
      typeLabels: {
        deliver: "Entrega",
        retire: "Retiro"
      },
      priorityLabels: {
        normal: "Normal",
        urgent: "Urgente"
      },
      taskActions: {
        view: "Ver",
        go: "Ir",
        call: "Llamar",
        finalize: "Finalizar",
        unassign: "Desasignar",
        assign: "Asignar",
        assigning: "Asignando...",
        finalizing: "Finalizando..."
      },
      taskInfo: {
        noReference: "Sin referencia",
        address: "Dirección",
        contact: "Contacto",
        note: "Nota:",
        multipleTask: "Tarea Múltiple",
        multipleTaskFormat: "de",
        scheduledFor: "Programada para:",
        confirmed: "Confirmada"
      },
      certificates: {
        freight: "Certificado de Flete",
        fob: "Certificación de FOB",
        bunker: "Certificación de BUNKER",
        mbl: "MBL",
        hbl: "HBL"
      },
      successMessages: {
        taskFinalized: "Tarea Finalizada",
        taskFinalizedDescription: "¡La tarea se ha finalizado exitosamente!",
        taskAssigned: "Tarea Asignada",
        taskAssignedDescription: "¡La tarea se ha asignado exitosamente!",
        taskUnassigned: "Tarea Desasignada",
        taskUnassignedDescription: "¡La tarea se ha desasignado exitosamente!"
      },
      errorMessages: {
        title: "Error",
        finalizeError: "Error al finalizar la tarea",
        assignError: "Error al asignar la tarea",
        unassignError: "Error al desasignar la tarea",
        retry: "Reintentar"
      },
      taskCount: (count: number) => 
        `${count} tarea${count !== 1 ? 's' : ''} ${count === 1 ? 'asignada' : 'asignadas'}`,
      tabs: {
        myTasks: "Mis Tareas",
        unassigned: "Sin Asignar"
      },
      loading: "Cargando tareas...",
      hasUnassigned: "Tienes tareas sin asignar",
      seeAvailable: "Ver tareas disponibles"
    },
    // Finalize Task Modal
    finalizeTask: {
      title: "Finalizar Tarea",
      subtitle: "Completa todos los pasos para finalizar la tarea",
      taskNotes: "Notas Importantes",
      taskNotesDescription: "Información adicional para esta tarea",
      receiptPhoto: "Foto del Comprobante",
      receiptPhotoOptional: "Foto del Comprobante (Opcional)",
      receiptPhotoRequired: "Foto de Recibo Obligatoria",
      receiptPhotoRequiredDesc: "Necesaria para completar la entrega",
      receiptPhotoUploaded: "Foto de recibo cargada correctamente",
      additionalPhotos: "Fotos Adicionales",
      additionalPhotosLabel: "Fotos Adicionales (Opcional)",
      additionalPhotosDesc: "Agregá múltiples fotos para documentar detalles extra",
      noAdditionalPhotos: "No hay fotos adicionales",
      photoAdditional: "Foto adicional",
      removePhoto: "Eliminar",
      cancel: "Cancelar",
      submit: "Finalizar Tarea",
      submitting: "Finalizando...",
      errorMessage: "Debe cargar una foto del recibo para finalizar"
    },
    // Dashboard
    dashboard: {
      title: "Dashboard",
      overview: "Resumen General",
      statistics: "Estadísticas",
      recentTasks: "Tareas Recientes",
      upcomingTasks: "Próximas Tareas",
      completedTasks: "Tareas Completadas",
      pendingTasks: "Tareas Pendientes",
      urgentTasks: "Tareas Urgentes",
      allTasks: "Todas las Tareas",
      totalTasks: "Total de Tareas",
      activeCouriers: "Cadetes Activos",
      viewAll: "Ver Todo",
      noTasks: "No hay tareas para mostrar",
      loading: "Cargando estadísticas...",
      tasksList: "Lista de Tareas",
      filterBy: "Filtrar por",
      searchPlaceholder: "Buscar tareas...",
      status: "Estado",
      priority: "Prioridad",
      type: "Tipo",
      date: "Fecha",
      client: "Cliente",
      courier: "Cadete"
    },
    // Common
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      confirm: "Confirmar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      view: "Ver",
      back: "Volver",
      next: "Siguiente",
      previous: "Anterior",
      close: "Cerrar",
      search: "Buscar",
      filter: "Filtrar",
      clear: "Limpiar",
      noData: "No hay datos",
      yes: "Sí",
      no: "No",
      retry: "Reintentar",
      create: "Crear",
      update: "Actualizar"
    },
    // Clients
    clients: {
      title: "Clientes",
      newClient: "Nuevo Cliente",
      clientDetails: "Detalles del Cliente",
      name: "Nombre",
      email: "Email",
      phone: "Teléfono",
      address: "Dirección",
      city: "Ciudad",
      province: "Provincia",
      noClients: "No hay clientes",
      createClient: "Crear Cliente",
      clientsList: "Lista de Clientes"
    },
    // Couriers
    couriers: {
      title: "Cadetes",
      management: "Gestión de Cadetes",
      description: "Administra los cadetes de tu organización",
      newCourier: "Nuevo Cadete",
      courierDetails: "Detalles del Cadete",
      name: "Nombre",
      email: "Email",
      phone: "Teléfono",
      licenseNumber: "Número de Licencia",
      licensePhoto: "Foto de Licencia",
      noCouriers: "No hay cadetes",
      noCouriersFiltered: "No se encontraron cadetes con ese criterio",
      noCouriersRegistered: "No hay cadetes registrados",
      createCourier: "Crear Cadete",
      couriersList: "Lista de Cadetes",
      searchPlaceholder: "Buscar por nombre, email, teléfono o vehículo...",
      delete: "Eliminar",
      deleteTitle: "Eliminar Courier",
      deleteConfirm: "¿Estás seguro de que quieres eliminar este courier? Esta acción no se puede deshacer.",
      deleteError: "Error al eliminar el cadete",
      vehicle: "Vehículo",
      status: "Estado",
      active: "Activo",
      inactive: "Inactivo",
      actions: "Acciones"
    },
    // Providers
    providers: {
      title: "Proveedores",
      management: "Gestión de Proveedores",
      description: "Administra los proveedores de tu organización",
      newProvider: "Nuevo Proveedor",
      providerDetails: "Detalles del Proveedor",
      name: "Nombre",
      email: "Email",
      phone: "Teléfono",
      address: "Dirección",
      city: "Ciudad",
      province: "Provincia",
      noProviders: "No hay proveedores",
      noProvidersFiltered: "No se encontraron proveedores con ese criterio",
      noProvidersRegistered: "No hay proveedores registrados",
      createProvider: "Crear Proveedor",
      providersList: "Lista de Proveedores",
      searchPlaceholder: "Buscar por nombre, dirección, ciudad o email...",
      delete: "Eliminar",
      deleteTitle: "Eliminar Proveedor",
      deleteConfirm: "¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.",
      deleteError: "Error al eliminar el proveedor"
    },
    // Tasks Management
    tasks: {
      title: "Tareas",
      management: "Gestión de Tareas",
      description: "Administra las tareas de tu organización",
      newTask: "Nueva Tarea",
      taskDetails: "Detalles de la Tarea",
      referenceNumber: "Número de Referencia",
      status: "Estado",
      priority: "Prioridad",
      type: "Tipo",
      scheduledDate: "Fecha Programada",
      courier: "Cadete",
      client: "Cliente",
      provider: "Proveedor",
      noTasks: "No hay tareas",
      createTask: "Crear Tarea",
      tasksList: "Lista de Tareas",
      searchPlaceholder: "Buscar por referencia, cliente, proveedor o cadete...",
      filterByStatus: "Filtrar por estado",
      filterByType: "Filtrar por tipo",
      sortBy: "Ordenar por",
      order: "Orden",
      exportAll: "Exportar Todas",
      exportFiltered: "Exportar Filtradas",
      allStatuses: "Todos los Estados",
      allTypes: "Todos los Tipos",
      createdAt: "Fecha de Creación",
      referenceNum: "Número de Referencia",
      deleteConfirm: "¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.",
      deleteTitle: "Eliminar Tarea",
      deleteSuccess: "Tarea eliminada exitosamente",
      deleteError: "Error al eliminar la tarea",
      noData: "No se encontraron tareas",
      actions: "Acciones"
    },
    // Dialogs
    dialogs: {
      confirmDelete: "Confirmar eliminación",
      cannotUndo: "Esta acción no se puede deshacer.",
      deleteSuccess: "eliminado exitosamente",
      deleteError: "Error al eliminar",
      savedSuccess: "guardado exitosamente",
      updateSuccess: "actualizado exitosamente",
      loading: "Cargando..."
    },
    // Login
    login: {
      title: "Courier Management",
      description: "Sign in to manage your delivery operations",
      email: "Correo Electrónico",
      emailPlaceholder: "admin@ejemplo.com",
      password: "Contraseña",
      rememberMe: "Recordar contraseña",
      signIn: "Iniciar Sesión",
      signingIn: "Iniciando sesión...",
      error: "Correo electrónico o contraseña inválidos. Intenta de nuevo."
    },
    // Form Pages
    forms: {
      courierCreated: "Courier creado exitosamente!",
      creating: "Creando...",
      createCourier: "Crear Courier",
      saving: "Guardando...",
      addressPlaceholder: "Ingresa la dirección completa...",
      notesPlaceholder: "Agrega notas adicionales sobre este courier...",
      providerCreated: "Proveedor Creado",
      providerCreatedDesc: "El proveedor ha sido creado exitosamente.",
      completeAllFields: "Por favor completa todos los campos obligatorios",
      errorCreatingProvider: "Error al crear proveedor",
      createProvider: "Crear Proveedor",
      creatingProvider: "Creando...",
      creationMode: "Modo de creación activo - Completa la información del proveedor y haz clic en \"Crear Proveedor\" para confirmar o \"Cancelar\" para descartar",
      clientCreated: "Cliente Creado",
      clientCreatedDesc: "El cliente ha sido creado exitosamente.",
      errorCreatingClient: "Error al crear cliente",
      createClient: "Crear Cliente",
      creatingClient: "Creando...",
      clientCreationMode: "Modo de creación activo - Completa la información del cliente y haz clic en \"Crear Cliente\" para confirmar o \"Cancelar\" para descartar",
      taskUpdated: "Tarea Actualizada",
      taskUpdatedDesc: "La tarea ha sido actualizada exitosamente.",
      taskCreated: "Tarea Creada",
      taskCreatedDesc: "La tarea ha sido creada exitosamente.",
      newTask: "Nueva Tarea",
      newTaskDesc: "Crea una nueva tarea de entrega o retiro",
      editTask: "Tarea",
      editTaskDesc: "Edita los detalles de la tarea",
      deleteTaskTitle: "Eliminar Tarea",
      taskDeleted: "Tarea Eliminada",
      taskDeletedDesc: "ha sido eliminada exitosamente.",
      errorDeleting: "Error eliminando la tarea. Intenta de nuevo."
    },
    // Task Detail
    taskDetail: {
      notScheduled: "No programada",
      noAddress: "Sin dirección especificada",
      noContact: "Sin contacto especificado",
      noCity: "Sin ciudad especificada"
    }
  }
} as const

// Helper function para obtener traducciones
export function getTranslation(locale: Locale = 'es') {
  return translations[locale]
}

// Helper para obtener textos anidados
export function t(key: string, locale: Locale = 'es'): string {
  const keys = key.split('.')
  let value: any = translations[locale]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Si no se encuentra, devolver la clave
    }
  }
  
  return typeof value === 'string' ? value : key
}

