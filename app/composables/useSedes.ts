import type { Sede } from '~/types/sede'

export const useSedes = () => {
    const { fetchWithAuth } = useApi()
    const sedes = ref<Sede[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchAll = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await fetchWithAuth<Sede[]>('sedes')
            sedes.value = data
        } catch (err: any) {
            error.value = err.message
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    const create = async (data: Partial<Sede>) => {
        loading.value = true
        try {
            const newItem = await fetchWithAuth<Sede>('sedes', {
                method: 'POST',
                body: data,
            })
            sedes.value.push(newItem)
            return newItem
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const update = async (id: number, data: Partial<Sede>) => {
        loading.value = true
        try {
            const updated = await fetchWithAuth<Sede>(`sedes/${id}`, {
                method: 'PATCH',
                body: data,
            })
            const index = sedes.value.findIndex(s => s.id_sede === id)
            if (index !== -1) sedes.value[index] = updated
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
            await fetchWithAuth(`sedes/${id}`, { method: 'DELETE' })
            sedes.value = sedes.value.filter(s => s.id_sede !== id)
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return { sedes, loading, error, fetchAll, create, update, remove }
}