# OptiCore

OptiCore es ahora una plataforma B2B para la cadena de suministro de ópticas. Incluye un asistente de IA para mapeo de datos y soporta múltiples **socios comerciales** (proveedores, distribuidores, importadores, etc.).

## Stack Tecnológico
- **Next.js 14** con App Router
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/UI**
- **Supabase** (PostgreSQL, Auth, Storage)
- **OpenAI** para procesamiento de lenguaje natural y mapeo inteligente de datos
- **xlsx** para lectura de archivos Excel

## Configuración del Entorno
1. Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido y reemplaza los valores por tus credenciales:
   ```
   NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_DE_SUPABASE
   OPENAI_API_KEY=TU_API_KEY_DE_OPENAI
   ```
2. Configura un nuevo proyecto en [Supabase](https://supabase.com) y obtén tu URL y Anon Key.
3. Obtén una API key de [OpenAI](https://platform.openai.com/).

## Instalación y Ejecución
```bash
npm install
```

1. Ejecuta el script SQL de `database.sql` en el editor SQL de Supabase para crear las tablas.
2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

Accede a `http://localhost:3000` para ver la aplicación.
