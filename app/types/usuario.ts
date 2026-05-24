export interface Usuario {
    id_usuario: number        // convertimos bigint a number
    email: string | null
    google_id: string | null
    id_sede: number
    id_rol_usuario: number
    nombres: string
    apellidos: string | null
    telefono: string | null
    password_hash: string | null
    estado: boolean | null
    created_at: string | null
    avatar_url: string | null
    estado_acceso: string | null
    // Relaciones opcionales (si las necesitas mostrar)
    rol?: { id_rol_usuario: number; nombre: string }
    sede?: { id_sede: number; nombre: string }
}