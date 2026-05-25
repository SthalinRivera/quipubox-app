<script setup lang="ts">
const router = useRouter();
const { $supabase } = useNuxtApp();
const { fetchUser } = useAuth();

onMounted(async () => {
  // Pequeño retraso para asegurar que el hash se procese (en producción es necesario)
  await new Promise(resolve => setTimeout(resolve, 300));

  let timeoutId: ReturnType<typeof setTimeout>;
  let unsubscribe: () => void = () => {};

  try {
    // Escuchar el evento de autenticación de Supabase
    const { data: { subscription } } = $supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Cancelar timeout y suscripción
        clearTimeout(timeoutId);
        subscription.unsubscribe();
        
        // Sincronizar con nuestro backend
        await fetchUser();
        
        // Redirigir al dashboard
        router.push('/dashboard/perfil');
      }
    });
    unsubscribe = () => subscription.unsubscribe();

    // Timeout de 10 segundos por si algo falla
    timeoutId = setTimeout(() => {
      unsubscribe();
      console.error('Timeout esperando autenticación de Supabase');
      router.push('/login');
    }, 10000);
  } catch (error) {
    console.error('Callback error:', error);
    router.push('/login');
  }
});
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <p>Completando autenticación...</p>
  </div>
</template>