# Reconciler tool — Guía de Deploy

## Estructura del proyecto
```
reconciler/
├── api/
│   └── parse-pdf.js       ← función segura que llama a Anthropic
├── src/
│   ├── App.jsx            ← la aplicación principal
│   └── main.jsx           ← punto de entrada
├── index.html
├── package.json
└── vite.config.js
```

## Pasos para publicar en Vercel

### 1. Instalar Node.js (si no lo tienes)
Descarga desde https://nodejs.org (versión LTS)

### 2. Instalar dependencias
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
```

### 3. Probar en local (opcional)
```bash
npm run dev
```
Abre http://localhost:5173 para ver la app.

### 4. Subir a GitHub
- Crea un repositorio en https://github.com
- Sube todos los archivos del proyecto

### 5. Conectar con Vercel
- Ve a https://vercel.com y crea una cuenta gratuita
- Haz clic en "Add New Project"
- Conecta tu repositorio de GitHub
- Vercel detecta Vite automáticamente → haz clic en "Deploy"

### 6. Añadir la API Key de Anthropic
En el dashboard de Vercel:
- Settings → Environment Variables
- Nombre: `ANTHROPIC_API_KEY`
- Valor: tu API key (empieza por `sk-ant-...`)
- Haz clic en Save y luego en "Redeploy"

### 7. ¡Listo!
Vercel te da una URL pública (ej: `embat-reconciler.vercel.app`) que puedes compartir con tu equipo.

## Cómo conseguir una API Key de Anthropic
1. Ve a https://console.anthropic.com
2. Crea una cuenta
3. Settings → API Keys → Create Key

## Notas de seguridad
- La API key NUNCA sale del servidor (está en `api/parse-pdf.js`)
- Los archivos PDF se procesan en memoria y no se guardan
- Recomendado para uso interno del equipo
