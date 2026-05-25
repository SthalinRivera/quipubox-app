<script setup lang="ts">
const router = useRouter();
const { $supabase } = useNuxtApp();
const { fetchUser } = useAuth();

onMounted(async () => {
  try {
    // Esperar sesión de Supabase (máx 5s)
    const sessionPromise = $supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout obteniendo sesión')), 5000)
    );
    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

    if (!session) throw new Error('No session after OAuth');

    // Llamar al backend con timeout (8s)
    await Promise.race([
      fetchUser(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout API')), 8000))
    ]);

    router.push('/dashboard/perfil');
  } catch (error) {
    console.error('Callback error:', error);
    router.push('/login');
  }
});
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <p>Autenticando...</p>
  </div>
</template>