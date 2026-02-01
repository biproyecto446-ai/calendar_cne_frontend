# Frontend - Calendario Corporativo

Dashboard profesional con React + Vite, Tailwind CSS y FullCalendar. Incluye vista mensual/diaria, filtro por tipo y panel lateral con detalle.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Conectar con Backend local

Crea un archivo `.env` en `frontend/` con:

```
VITE_EVENTS_API=http://localhost:4000
```

## Conectar Google Sheets en tiempo real

El componente lee un CSV público de Google Sheets y se actualiza cada 5 minutos.

1. En Google Sheets: `Archivo → Compartir → Publicar en la web`.
2. Elige la pestaña correcta y publica como CSV.
3. Copia el ID del spreadsheet y el `gid` de la pestaña.

Edita en `src/components/CompanyCalendar.jsx`:

- `sheetsConfig.spreadsheetId`
- `sheetsConfig.gid`

## Estructura de columnas (modo lista)

El CSV debe incluir encabezados con estos nombres (ajusta `columnMap` si cambian):

- `Fecha` (YYYY-MM-DD)
- `Hora` (HH:mm)
- `Actividad`
- `Descripcion`
- `Responsable`
- `Tipo`
- `Area`
- `Enlace`

## Personalización rápida

- Colores y tipografía: `tailwind.config.js`
- Estilos del calendario: `src/index.css`
- UI principal: `src/components/CompanyCalendar.jsx`
