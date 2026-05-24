import type { Usuario } from '~/types/usuario'

export const useUsuarios = () => {
    const { fetchWithAuth } = useApi()
    const usuarios = ref<Usuario[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchAll = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await fetchWithAuth<Usuario[]>('usuarios')
            usuarios.value = data
        } catch (err: any) {
            error.value = err.message
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    const fetchOne = async (id: number): Promise<Usuario | null> => {
        try {
            return await fetchWithAuth<Usuario>(`usuarios/${id}`)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    const create = async (data: Partial<Usuario>) => {
        loading.value = true
        try {
            const newUser = await fetchWithAuth<Usuario>('usuarios', {
                method: 'POST',
                body: data,
            })
            // Actualizar lista local
            usuarios.value.push(newUser)
            return newUser
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const update = async (id: number, data: Partial<Usuario>) => {
        loading.value = true
        try {
            const updated = await fetchWithAuth<Usuario>(`usuarios/${id}`, {
                method: 'PATCH',
                body: data,
            })
            const index = usuarios.value.findIndex(u => u.id_usuario === id)
            if (index !== -1) usuarios.value[index] = updated
            return updated
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const remove = async (id: number) => {
        loading.value = true
        try {
            await fetchWithAuth(`usuarios/${id}`, { method: 'DELETE' })
            usuarios.value = usuarios.value.filter(u => u.id_usuario !== id)
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        usuarios,
        loading,
        error,
        fetchAll,
        fetchOne,
        create,
        update,
        remove,
    }
}