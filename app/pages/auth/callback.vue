<script setup lang="ts">

const router = useRouter()

const { fetchUser } =
    useAuth()

onMounted(async () => {

    try {

        await fetchUser()

        router.push('/dashboard/perfil')

    } catch (error) {

        console.error(error)

        router.push('/login')
    }
})
</script>

<template>
    <div
        class="flex h-screen items-center justify-center"
    >
        <p>Autenticando...</p>
    </div>
</template>