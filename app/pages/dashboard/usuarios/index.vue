<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Usuarios">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Nuevo Usuario" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5 mb-4">
        <UInput
          v-model="search"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Buscar por email o nombre..."
        />
        <div class="flex gap-2">
          <USelect
            v-model="rolFilter"
            :items="[{ label: 'Todos', value: 'all' }, ...rolesOptions]"
            placeholder="Filtrar por rol"
            class="min-w-32"
          />
          <UButton color="neutral" variant="outline" icon="i-lucide-rotate-cw" @click="refresh" />
        </div>
      </div>

      <UTable
        :data="filteredUsuarios"
        :columns="columns"
        :loading="loading"
        class="shrink-0"
      >
        <!-- Slot personalizado para la columna avatar_url -->
        <template #avatar_url-data="{ row }">
          <UAvatar
            :src="row.avatar_url || undefined"
            :text="getInitials(row.nombres, row.apellidos)"
            size="sm"
            :alt="`Avatar de ${row.nombres}`"
          />
        </template>

        <!-- Slot para la columna estado_acceso -->
        <template #estado_acceso-data="{ row }">
          <UBadge :color="row.estado_acceso === 'activo' ? 'success' : 'error'">
            {{ row.estado_acceso }}
          </UBadge>
        </template>

        <!-- Slot para la columna actions -->
        <template #actions-data="{ row }">
          <UDropdownMenu :items="getRowActions(row)">
            <UButton icon="i-lucide-more-horizontal" color="neutral" variant="ghost" />
          </UDropdownMenu>
        </template>
      </UTable>

      <div class="flex justify-end mt-4">
        <UPagination
          v-model="page"
          :page-count="pageSize"
          :total="filteredUsuarios.length"
        />
      </div>
    </template>
  </UDashboardPanel>

  <UsuarioModal
    v-model="showModal"
    :editing-user="selectedUser"
    @saved="refresh"
  />
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Usuario } from '~/types/usuario'
import { useUsuarios } from '~/composables/useUsuarios'

definePageMeta({
  layout: 'dashboard'
})

const { usuarios, loading, fetchAll, remove } = useUsuarios()
const search = ref('')
const rolFilter = ref('all')
const page = ref(1)
const pageSize = 10
const showModal = ref(false)
const selectedUser = ref<Usuario | null>(null)

// Función para obtener iniciales a partir de nombres y apellidos
function getInitials(nombres: string, apellidos: string | null): string {
  const primeraLetraNombre = nombres?.charAt(0) || ''
  const primeraLetraApellido = apellidos?.charAt(0) || ''
  return (primeraLetraNombre + primeraLetraApellido).toUpperCase() || '?'
}

// Opciones para el filtro de rol
const rolesOptions = computed(() => {
  const uniqueRoles = new Map()
  usuarios.value.forEach(u => {
    if (u.id_rol_usuario && u.rol?.nombre) {
      uniqueRoles.set(u.id_rol_usuario, { label: u.rol.nombre, value: u.id_rol_usuario })
    }
  })
  return Array.from(uniqueRoles.values())
})

const filteredUsuarios = computed(() => {
  let filtered = [...usuarios.value]
  if (search.value) {
    const term = search.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.email?.toLowerCase().includes(term) ||
      u.nombres.toLowerCase().includes(term) ||
      u.apellidos?.toLowerCase().includes(term)
    )
  }
  if (rolFilter.value !== 'all') {
    filtered = filtered.filter(u => u.id_rol_usuario === Number(rolFilter.value))
  }
  const start = (page.value - 1) * pageSize
  return filtered.slice(start, start + pageSize)
})

// Definición de columnas (sin propiedad 'cell')
const columns: TableColumn<Usuario>[] = [
  { accessorKey: 'id_usuario', header: 'ID' },
   {
    accessorKey: 'avatar_url',
    header: 'Avatar',
    cell: ({ row }) => h(UAvatar, {
      src: row.original.avatar_url || undefined,
      text: getInitials(row.original.nombres, row.original.apellidos),
      size: 'sm',
      alt: row.original.nombres,
    })
  },
  { accessorKey: 'nombres', header: 'Nombres' },
  { accessorKey: 'apellidos', header: 'Apellidos' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'telefono', header: 'Teléfono' },
 {
    accessorKey: 'estado_acceso',
    header: 'Estado',
    cell: ({ row }) => h(UBadge, {
      color: row.original.estado_acceso === 'activo' ? 'success' : 'error',
    }, () => row.original.estado_acceso)
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => h('div', { class: 'text-right' }, [
      h(UDropdownMenu, {
        items: getRowActions(row.original),
        content: { align: 'end' }
      }, () => h(UButton, { icon: 'i-lucide-more-horizontal', color: 'neutral', variant: 'ghost' }))
    ])
  }
]

function getRowActions(row: Usuario) {
  return [
    {
      label: 'Editar',
      icon: 'i-lucide-edit',
      onSelect: () => {
        selectedUser.value = row
        showModal.value = true
      }
    },
    {
      label: 'Eliminar',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: async () => {
        if (confirm(`¿Eliminar usuario ${row.email}?`)) {
          await remove(row.id_usuario)
        }
      }
    }
  ]
}

function openCreateModal() {
  selectedUser.value = null
  showModal.value = true
}

async function refresh() {
  await fetchAll()
}

onMounted(() => {
  refresh()
})
</script>