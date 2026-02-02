import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  RotateCw,
  Plus,
  Download,
  Monitor,
  ShieldCheck,
  Megaphone,
  ClipboardList,
  LifeBuoy,
  BarChart3,
  BookOpen,
  Landmark,
  Wifi,
  Users,
  IdCard,
  Presentation,
  Server,
} from "lucide-react"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader } from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"

const sheetsConfig = {
  spreadsheetId: "19KhdY0IHhYTxxS6eG3JlMTg1gh7U4uHr",
  gid: "2033538575",
}

const enableSheets = false

const sheetCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheetId}/export?format=csv&gid=${sheetsConfig.gid}`

const apiConfig = {
  baseUrl: import.meta.env.VITE_EVENTS_API || "",
}

const columnMap = {
  fecha: "Fecha",
  hora: "Hora",
  actividad: "Actividad",
  descripcion: "Descripcion",
  responsable: "Responsable",
  tipo: "Tipo",
  enlace: "Enlace",
  area: "Area",
}

const componentOptions = [
  "Apoyo en Puestos de Votación",
  "App_Asistencia y Reporte Real",
  "App_Consulta Credenciales",
  "BI-Análitica",
  "Cartilla ABC Testigos Electorales",
  "Ciberseguridad y Seguridad de la Información",
  "Cronograma PMO",
  "Estrategia de Comunicación",
  "Herramienta Custodio",
  "Medios de Capacitación - Actores Electorales",
  "Mesa de Ayuda",
  "SIMAE (Sistema Nacional de Monitoreo y Análitica Electoral)",
]

const componentIcons = {
  "Apoyo en Puestos de Votación": Landmark,
  "App_Asistencia y Reporte Real": Wifi,
  "App_Consulta Credenciales": IdCard,
  "BI-Análitica": BarChart3,
  "Cartilla ABC Testigos Electorales": BookOpen,
  "Ciberseguridad y Seguridad de la Información": ShieldCheck,
  "Cronograma PMO": ClipboardList,
  "Estrategia de Comunicación": Megaphone,
  "Herramienta Custodio": Server,
  "Medios de Capacitación - Actores Electorales": Presentation,
  "Mesa de Ayuda": LifeBuoy,
  "SIMAE (Sistema Nacional de Monitoreo y Análitica Electoral)": Users,
}

const fallbackEvents = [
  {
    id: "evt-101",
    Fecha: "2026-02-03",
    Hora: "09:30",
    Actividad: "Comité Ejecutivo",
    Descripcion: "Revisión mensual de KPIs y prioridades estratégicas.",
    Responsable: "María Torres",
    Tipo: "Dirección",
    Prioridad: "Media",
    Enlace: "https://meet.google.com/ejecutivo",
  },
]

const typeStyles = {
  Dirección: "bg-brand-800 text-white",
  Marketing: "bg-slate-700 text-white",
  Operaciones: "bg-brand-700 text-white",
  Talento: "bg-slate-600 text-white",
  Finanzas: "bg-brand-900 text-white",
  Producto: "bg-slate-800 text-white",
  Seguridad: "bg-brand-950 text-white",
  General: "bg-brand-700 text-white",
}

const areaStyles = {
  PMO: "bg-blue-600 text-white",
  Comunicaciones: "bg-slate-700 text-white",
  Operaciones: "bg-emerald-600 text-white",
  Talento: "bg-rose-500 text-white",
  Finanzas: "bg-indigo-700 text-white",
  Tecnología: "bg-cyan-700 text-white",
  Legal: "bg-amber-600 text-white",
  General: "bg-brand-700 text-white",
  "Sin área": "bg-slate-500 text-white",
}

const componentColors = {
  "Apoyo en Puestos de Votación": "bg-blue-700 text-white",
  "App_Asistencia y Reporte Real": "bg-cyan-700 text-white",
  "App_Consulta Credenciales": "bg-indigo-700 text-white",
  "BI-Análitica": "bg-emerald-700 text-white",
  "Cartilla ABC Testigos Electorales": "bg-rose-600 text-white",
  "Ciberseguridad y Seguridad de la Información": "bg-slate-800 text-white",
  "Cronograma PMO": "bg-amber-600 text-white",
  "Estrategia de Comunicación": "bg-purple-700 text-white",
  "Herramienta Custodio": "bg-teal-700 text-white",
  "Medios de Capacitación - Actores Electorales": "bg-fuchsia-700 text-white",
  "Mesa de Ayuda": "bg-sky-700 text-white",
  "SIMAE (Sistema Nacional de Monitoreo y Análitica Electoral)":
    "bg-lime-700 text-white",
}

const getAreaList = (areaValue) => {
  if (Array.isArray(areaValue)) return areaValue.filter(Boolean)
  return areaValue ? [areaValue] : []
}

const getAreaLabel = (areaValue) => {
  const list = getAreaList(areaValue)
  return list.length ? list.join(", ") : "Sin área"
}

const getPrimaryArea = (areaValue) => {
  const list = getAreaList(areaValue)
  return list[0] || "Sin área"
}

const getComponentColor = (areaValue) => {
  const primary = getPrimaryArea(areaValue)
  return componentColors[primary] || areaStyles[primary] || "bg-brand-700 text-white"
}

const getPriorityStyle = (priorityValue) => {
  const text = (priorityValue || "").toLowerCase()
  if (text.includes("alta") || text.includes("urgente") || text.includes("crítico")) {
    return "border-rose-200 bg-rose-50/40"
  }
  if (text.includes("media")) {
    return "border-amber-200 bg-amber-50/40"
  }
  if (text.includes("baja")) {
    return "border-emerald-200 bg-emerald-50/40"
  }
  return "border-slate-200"
}

const getTipoIcon = (tipoValue) => {
  const text = (tipoValue || "").toLowerCase()
  if (text.includes("reunión") || text.includes("reunion")) return Users
  if (text.includes("capacitación") || text.includes("capacitacion"))
    return Presentation
  if (text.includes("seguimiento") || text.includes("kpi")) return BarChart3
  if (text.includes("comunicación") || text.includes("comunicacion"))
    return Megaphone
  if (text.includes("seguridad")) return ShieldCheck
  return ClipboardList
}

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date)

const formatDateOnly = (date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
  }).format(date)

const formatShortTime = (date) =>
  new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)

const parseDateTime = (fecha, hora) => {
  if (!fecha) return null
  const safeHora = hora && hora.trim().length > 0 ? hora : "09:00"
  const date = new Date(`${fecha}T${safeHora}:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const mapRowsToEvents = (rows) =>
  rows
    .map((item, index) => {
      const fecha = item[columnMap.fecha]
      const hora = item[columnMap.hora]
      const start = parseDateTime(fecha, hora)
      if (!start) return null
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      return {
        id: item.id || `evt-${index + 1}`,
        title: item[columnMap.actividad] || "Actividad",
        start,
        end,
        extendedProps: {
          descripcion: item[columnMap.descripcion] || "Sin descripción.",
          responsable: item[columnMap.responsable] || "Sin asignar",
          tipo: item[columnMap.tipo] || "General",
          prioridad: item["Prioridad"] || "Media",
          area: item[columnMap.area] || [],
          enlace: item[columnMap.enlace] || "",
          fecha,
          hora: hora || "09:00",
        },
      }
    })
    .filter(Boolean)

const mapApiEvents = (rows) =>
  rows
    .map((item, index) => {
      const start = parseDateTime(item.fecha, item.hora)
      if (!start) return null
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      return {
        id: item.id || `api-${index + 1}`,
        title: item.actividad || "Actividad",
        start,
        end,
        extendedProps: {
          descripcion: item.descripcion || "Sin descripción.",
          responsable: item.responsable || "Sin asignar",
          tipo: item.tipo || "General",
          prioridad: item.prioridad || "Media",
          area: item.area || [],
          enlace: item.enlace || "",
          fecha: item.fecha,
          hora: item.hora || "09:00",
        },
      }
    })
    .filter(Boolean)

const normalizeText = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()

const monthMap = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
}

const parseMonthYearFromRow = (row) => {
  const joined = row.filter(Boolean).join(" ").trim()
  const match = joined.match(/([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{4})/)
  if (!match) return null
  const monthName = normalizeText(match[1])
  const year = Number(match[2])
  if (!Number.isFinite(year) || !(monthName in monthMap)) return null
  return { month: monthMap[monthName], year }
}

const splitActivities = (text) => {
  if (!text) return []
  return text
    .split(/\n{2,}|\r{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

const extractTipo = (text) => {
  const match = text.match(/^([^:]{2,40}):\s*(.*)$/)
  if (!match) return { tipo: "General", detalle: text }
  const tipo = match[1].trim()
  const detalle = match[2].trim()
  return {
    tipo: tipo.length > 0 ? tipo : "General",
    detalle: detalle.length > 0 ? detalle : text,
  }
}

const mapGridToEvents = (gridRows) => {
  if (!Array.isArray(gridRows) || gridRows.length < 4) return []

  const monthInfo = parseMonthYearFromRow(gridRows[0] || [])
  if (!monthInfo) return []

  const { month, year } = monthInfo
  const events = []

  let weekIndex = 0
  let previousDay = null
  let currentMonthOffset = 0

  for (let i = 2; i < gridRows.length; i++) {
    const row = gridRows[i] || []
    const dayNumbers = row
      .slice(0, 7)
      .map((cell) => Number.parseInt(cell, 10))

    const isWeekRow = dayNumbers.some((value) => Number.isFinite(value))
    if (!isWeekRow) continue

    const nextRow = gridRows[i + 1] || []

    for (let col = 0; col < 7; col++) {
      const dayNumber = dayNumbers[col]
      if (!Number.isFinite(dayNumber)) continue

      if (weekIndex === 0 && dayNumber > 20) {
        currentMonthOffset = -1
      } else if (previousDay !== null && dayNumber < previousDay) {
        currentMonthOffset += 1
      }

      const eventText = nextRow[col]
      if (eventText && eventText.toString().trim().length > 0) {
        const activities = splitActivities(eventText)
        activities.forEach((activity, idx) => {
          const { tipo, detalle } = extractTipo(activity)
          const eventDate = new Date(year, month + currentMonthOffset, dayNumber)
          const start = parseDateTime(
            eventDate.toISOString().slice(0, 10),
            "09:00"
          )
          const end = new Date(start.getTime() + 60 * 60 * 1000)
          const title =
            detalle.length > 60 ? `${detalle.slice(0, 57)}...` : detalle

          events.push({
            id: `grid-${year}-${month}-${dayNumber}-${col}-${idx}`,
            title,
            start,
            end,
            extendedProps: {
              descripcion: activity,
              responsable: "Sin asignar",
              tipo,
              area: [],
              enlace: "",
              fecha: eventDate.toISOString().slice(0, 10),
              hora: "09:00",
            },
          })
        })
      }

      previousDay = dayNumber
    }

    weekIndex += 1
  }

  return events
}

export default function CompanyCalendar() {
  const calendarRef = useRef(null)
  const refreshTimer = useRef(null)
  const [currentView, setCurrentView] = useState("dayGridMonth")
  const [calendarTitle, setCalendarTitle] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterType, setFilterType] = useState("Todos")
  const [filterArea, setFilterArea] = useState("Todas")
  const [eventsData, setEventsData] = useState([])
  const [localEvents, setLocalEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isKioskMode, setIsKioskMode] = useState(false)
  const [now, setNow] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const weeklyScrollRef = useRef(null)
  const [presentationActive, setPresentationActive] = useState(false)
  const [presentationIndex, setPresentationIndex] = useState(0)
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "09:00",
    actividad: "",
    descripcion: "",
    responsable: "",
    tipo: "",
    prioridad: "Media",
    area: [],
    enlace: "",
  })
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [showCsvPreview, setShowCsvPreview] = useState(false)
  const [csvPreview, setCsvPreview] = useState("")

  const fetchEvents = useCallback(
    async ({ isInitial = false, isManual = false } = {}) => {
      try {
        setLoadError("")
        if (isInitial) setLoading(true)
        if (isManual) setIsRefreshing(true)
        if (apiConfig.baseUrl) {
          const response = await fetch(`${apiConfig.baseUrl}/events`, {
            cache: "no-store",
          })
          if (!response.ok) {
            throw new Error("No se pudo leer la API local.")
          }
          const data = await response.json()
          const mapped = mapApiEvents(Array.isArray(data) ? data : [])
          setEventsData(mapped.length ? mapped : mapRowsToEvents(fallbackEvents))
          if (isInitial) setLoading(false)
          return
        }
        // Cargar datos desde archivo JSON local cuando no hay API configurada
        if (!enableSheets) {
          const response = await fetch("/events.json", { cache: "no-store" })
          if (response.ok) {
            const data = await response.json()
            const mapped = mapApiEvents(Array.isArray(data) ? data : [])
            setEventsData(mapped.length ? mapped : mapRowsToEvents(fallbackEvents))
          } else {
            setEventsData(mapRowsToEvents(fallbackEvents))
          }
          if (isInitial) setLoading(false)
          return
        }
        const response = await fetch(sheetCsvUrl, { cache: "no-store" })
        if (!response.ok) {
          throw new Error("No se pudo leer el CSV público.")
        }
        const csvText = await response.text()
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header, index) => {
            const normalized = header?.trim()
            return normalized && normalized.length > 0
              ? normalized
              : `col_${index}`
          },
        })
        const fields = Array.isArray(parsed.meta?.fields)
          ? parsed.meta.fields
          : []
        const requiredFields = Object.values(columnMap)
        const missingFields = requiredFields.filter(
          (field) => !fields.includes(field)
        )

        const rows = Array.isArray(parsed.data) ? parsed.data : []
        if (missingFields.length > 0) {
          const gridParsed = Papa.parse(csvText, {
            header: false,
            skipEmptyLines: false,
          })
          const gridRows = Array.isArray(gridParsed.data)
            ? gridParsed.data
            : []
          const gridEvents = mapGridToEvents(gridRows)

          if (gridEvents.length === 0) {
            setEventsData(mapRowsToEvents(fallbackEvents))
            setLoadError(
              "No se pudo interpretar la hoja. Si usas calendario en cuadrícula, asegúrate de que el mes/año esté en la primera fila."
            )
            if (isInitial) setLoading(false)
            return
          }

          setEventsData(gridEvents)
          if (isInitial) setLoading(false)
          return
        }

        const mapped = mapRowsToEvents(rows)
        setEventsData(mapped.length ? mapped : mapRowsToEvents(fallbackEvents))
        if (isInitial) setLoading(false)
      } catch {
        setEventsData(mapRowsToEvents(fallbackEvents))
        if (isInitial) setLoading(false)
        setLoadError(
          "No se pudo sincronizar con Google Sheets. Mostrando datos de respaldo."
        )
      } finally {
        if (isManual) setIsRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchEvents({ isInitial: true })
    refreshTimer.current = setInterval(
      () => fetchEvents(),
      1000 * 60 * 5
    )

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current)
    }
  }, [fetchEvents])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (apiConfig.baseUrl) return
    localStorage.removeItem("company-calendar-events")
    setLocalEvents([])
  }, [])

  const allEvents = useMemo(
    () => [...eventsData, ...localEvents],
    [eventsData, localEvents]
  )
  const availableTypes = useMemo(() => {
    const types = new Set(allEvents.map((event) => event.extendedProps.tipo))
    return ["Todos", ...Array.from(types)]
  }, [allEvents])
  const availableAreas = useMemo(() => {
    const areas = new Set()
    allEvents.forEach((event) => {
      const list = getAreaList(event.extendedProps.area)
      if (list.length === 0) {
        areas.add("Sin área")
      } else {
        list.forEach((area) => areas.add(area))
      }
    })
    return ["Todas", ...Array.from(areas)]
  }, [allEvents])

  const events = useMemo(() => {
    let filtered = allEvents
    if (filterType !== "Todos") {
      filtered = filtered.filter(
        (event) => event.extendedProps.tipo === filterType
      )
    }
    if (filterArea !== "Todas") {
      filtered = filtered.filter((event) => {
        const list = getAreaList(event.extendedProps.area)
        if (filterArea === "Sin área") return list.length === 0
        return list.includes(filterArea)
      })
    }
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase()
      filtered = filtered.filter((event) => {
        const areaText = getAreaLabel(event.extendedProps.area).toLowerCase()
        return (
          event.title.toLowerCase().includes(query) ||
          event.extendedProps.descripcion.toLowerCase().includes(query) ||
          event.extendedProps.responsable.toLowerCase().includes(query) ||
          event.extendedProps.tipo.toLowerCase().includes(query) ||
          areaText.includes(query)
        )
      })
    }
    return filtered
  }, [allEvents, filterType, filterArea, searchQuery])

  const todayKey = useMemo(() => {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  }, [])
  const todayEvents = useMemo(() => {
    return events
      .filter((event) => event.extendedProps.fecha === todayKey)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [events, todayKey])
  const upcomingEvents = useMemo(() => {
    const nowTime = now.getTime()
    return events
      .filter((event) => event.start.getTime() >= nowTime)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 8)
  }, [events, now])
  const weeklySummary = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const key = date.toISOString().slice(0, 10)
      const items = events
        .filter((event) => event.extendedProps.fecha === key)
        .sort((a, b) => a.start.getTime() - b.start.getTime())
      return { date, key, items }
    })
    return days
  }, [events])
  const orderedPresentationEvents = useMemo(() => {
    return [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [events])

  const handleViewChange = (viewName) => {
    const api = calendarRef.current?.getApi()
    if (!api) return
    api.changeView(viewName)
    setCurrentView(viewName)
  }

  const handleNavigate = (action) => {
    const api = calendarRef.current?.getApi()
    if (!api) return
    if (action === "prev") api.prev()
    if (action === "next") api.next()
    if (action === "today") api.today()
  }

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event)
    setSheetOpen(true)
  }

  const renderEventContent = (eventInfo) => {
    const tipo = eventInfo.event.extendedProps.tipo
    const area = getPrimaryArea(eventInfo.event.extendedProps.area)
    const areaClass = getComponentColor(eventInfo.event.extendedProps.area)
    const typeClass = typeStyles[tipo] ?? "bg-brand-700 text-white"
    const hasArea = area && area !== "Sin área"
    const pillClass = hasArea ? areaClass : typeClass

    if (eventInfo.view.type === "dayGridMonth") {
      const enlace = eventInfo.event.extendedProps.enlace
      return (
        <div className="relative w-full">
          <div
            className={`w-full truncate rounded-full px-3 py-1 text-[12px] font-semibold ${pillClass}`}
          >
            {eventInfo.event.title}
          </div>
          {enlace ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                window.open(enlace, "_blank", "noopener,noreferrer")
              }}
              className="absolute -top-2 right-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-700 shadow-sm"
            >
              Presentación
            </button>
          ) : null}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-700">
          {eventInfo.timeText}
        </span>
        <span className="text-sm font-medium text-slate-900">
          {eventInfo.event.title}
        </span>
      </div>
    )
  }

  const handleFormChange = (field, value) => {
    setFormSuccess("")
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormError("")
    setFormSuccess("")
    setEditingEventId(null)
    setFormData({
      fecha: "",
      hora: "09:00",
      actividad: "",
      descripcion: "",
      responsable: "",
      tipo: "",
      prioridad: "Media",
      area: [],
      enlace: "",
    })
  }

  const handleAddEvent = () => {
    setFormError("")
    setFormSuccess("")
    if (!formData.fecha || !formData.actividad) {
      setFormError("Fecha y actividad son obligatorias.")
      return
    }

    const start = parseDateTime(formData.fecha, formData.hora)
    if (!start) {
      setFormError("Fecha u hora inválida.")
      return
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    if (apiConfig.baseUrl) {
      const payload = {
        fecha: formData.fecha,
        hora: formData.hora || "09:00",
        actividad: formData.actividad,
        descripcion: formData.descripcion || "Sin descripción.",
        responsable: formData.responsable || "Sin asignar",
        tipo: formData.tipo || "General",
        prioridad: formData.prioridad || "Media",
        area: formData.area || [],
        enlace: formData.enlace || "",
      }

      setIsSaving(true)
      const endpoint = editingEventId
        ? `${apiConfig.baseUrl}/events/${editingEventId}`
        : `${apiConfig.baseUrl}/events`
      const method = editingEventId ? "PUT" : "POST"

      fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(() => fetchEvents({ isManual: true }))
        .then(() => {
          setEditingEventId(null)
          setFormSuccess(
            editingEventId
              ? "Actividad actualizada correctamente."
              : "Actividad guardada correctamente."
          )
        })
        .catch(() =>
          setFormError("No se pudo guardar en el backend. Intenta de nuevo.")
        )
        .finally(() => setIsSaving(false))

      resetForm()
      return
    }

    const newEvent = {
      id: `local-${Date.now()}`,
      title: formData.actividad,
      start,
      end,
      extendedProps: {
        descripcion: formData.descripcion || "Sin descripción.",
        responsable: formData.responsable || "Sin asignar",
        tipo: formData.tipo || "General",
        prioridad: formData.prioridad || "Media",
        area: formData.area || [],
        enlace: formData.enlace || "",
        fecha: formData.fecha,
        hora: formData.hora || "09:00",
      },
    }

    const nextEvents = [newEvent, ...localEvents]
    setLocalEvents(nextEvents)
    localStorage.setItem(
      "company-calendar-events",
      JSON.stringify(nextEvents)
    )

    setFormSuccess("Actividad guardada correctamente.")
    resetForm()
  }

  const buildCsvData = () => {
    const headers = [
      "Fecha",
      "Hora",
      "Actividad",
      "Descripcion",
      "Responsable",
      "Tipo",
      "Componentes",
      "Enlace",
    ]
    const source = apiConfig.baseUrl ? eventsData : localEvents
    const rows = source.map((event) => [
      event.extendedProps.fecha,
      event.extendedProps.hora,
      event.title,
      event.extendedProps.descripcion,
      event.extendedProps.responsable,
      event.extendedProps.tipo,
      getAreaLabel(event.extendedProps.area),
      event.extendedProps.enlace,
    ])
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${(cell ?? "").toString().replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\n")
    return { headers, rows, csv }
  }

  const handleExportCsv = () => {
    const { csv } = buildCsvData()
    const bom = "\uFEFF"
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const today = new Date().toISOString().slice(0, 10)
    link.download = `eventos-calendario-${today}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handlePreviewCsv = () => {
    const { csv } = buildCsvData()
    setCsvPreview(csv)
    setShowCsvPreview(true)
  }

  const handleExportXlsx = () => {
    const { headers, rows } = buildCsvData()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Eventos")
    const today = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `eventos-calendario-${today}.xlsx`)
  }

  const handleEditEvent = (event) => {
    setEditingEventId(event.id)
    const areaValue = event.extendedProps.area
    const areaList = Array.isArray(areaValue)
      ? areaValue
      : areaValue
        ? [areaValue]
        : []
    setFormData({
      fecha: event.extendedProps.fecha,
      hora: event.extendedProps.hora || "09:00",
      actividad: event.title,
      descripcion: event.extendedProps.descripcion || "",
      responsable: event.extendedProps.responsable || "",
      tipo: event.extendedProps.tipo || "",
      prioridad: event.extendedProps.prioridad || "Media",
      area: areaList,
      enlace: event.extendedProps.enlace || "",
    })
  }

  const handleDeleteEvent = (eventId) => {
    if (!apiConfig.baseUrl) return
    const confirmed = window.confirm(
      "¿Deseas eliminar esta actividad? Esta acción no se puede deshacer."
    )
    if (!confirmed) return
    setIsDeleting(true)
    fetch(`${apiConfig.baseUrl}/events/${eventId}`, { method: "DELETE" })
      .then(() => fetchEvents({ isManual: true }))
      .catch(() => setFormError("No se pudo eliminar en el backend."))
      .finally(() => setIsDeleting(false))
  }

  const scrollWeekly = (direction) => {
    const container = weeklyScrollRef.current
    if (!container) return
    const cardWidth = 304
    container.scrollBy({
      left: direction === "next" ? cardWidth : -cardWidth,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    if (!presentationActive) return
    if (orderedPresentationEvents.length === 0) return

    const currentEvent =
      orderedPresentationEvents[presentationIndex] ??
      orderedPresentationEvents[0]
    setSelectedEvent(currentEvent)
    setSheetOpen(true)
    calendarRef.current?.getApi().gotoDate(currentEvent.start)
    calendarRef.current?.getApi().changeView("timeGridDay")

    const timer = setInterval(() => {
      setPresentationIndex((prev) => {
        const nextIndex = (prev + 1) % orderedPresentationEvents.length
        return nextIndex
      })
    }, 30000)

    return () => clearInterval(timer)
  }, [presentationActive, presentationIndex, orderedPresentationEvents])

  const handleToggleKiosk = () => {
    setIsKioskMode((prev) => !prev)
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsKioskMode(false)
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (max-width: 1024px)")
    const applyView = () => {
      if (media.matches) {
        handleViewChange("timeGridWeek")
      }
    }
    applyView()
    media.addEventListener?.("change", applyView)
    return () => media.removeEventListener?.("change", applyView)
  }, [])

  return (
    <div
      className={`min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10 ${
        isKioskMode ? "kiosk-mode" : ""
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm backdrop-blur lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
            <div className="flex items-center gap-3 text-brand-800">
              <CalendarDays className="h-6 w-6" />
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Calendario Eventos CNE
              </h1>
            </div>
              <p className="max-w-2xl text-sm text-slate-500">
                Consulta la agenda institucional en tiempo real para
                planificación, coordinación y seguimiento.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Fecha
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatDateOnly(now)}
                  </span>
                </div>
                <div className="hidden h-10 w-px bg-slate-200 sm:block" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Hora actual
                  </span>
                  <span className="text-lg font-semibold text-brand-800">
                    {formatShortTime(now)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">
                {calendarTitle || "Vista general"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={presentationActive ? "default" : "outline"}
                  onClick={() => {
                    if (events.length === 0) return
                    setPresentationActive((prev) => !prev)
                    setPresentationIndex(0)
                  }}
                >
                  {presentationActive ? "Detener presentación" : "Presentación"}
                </Button>
                <Button variant="outline" onClick={handleToggleKiosk}>
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isKioskMode ? "Salir pantalla completa" : "Pantalla completa"}
                </span>
                <span className="sm:hidden">
                  {isKioskMode ? "Salir" : "Pantalla"}
                </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchEvents({ isManual: true })}
                  disabled={isRefreshing}
                >
                  <RotateCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Actualizar ahora</span>
                  <span className="sm:hidden">Actualizar</span>
                </Button>
                <Button variant="outline" onClick={() => handleNavigate("today")}>
                  Hoy
                </Button>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleNavigate("prev")}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleNavigate("next")}
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
                <Button
                  size="lg"
                  variant={currentView === "dayGridMonth" ? "default" : "ghost"}
                  onClick={() => handleViewChange("dayGridMonth")}
                  aria-label="Vista mensual"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-sm">Mes</span>
                </Button>
                <Button
                  size="lg"
                  variant={currentView === "timeGridDay" ? "default" : "ghost"}
                  onClick={() => handleViewChange("timeGridDay")}
                  aria-label="Vista diaria"
                >
                  <List className="h-4 w-4" />
                  <span className="text-sm">Día</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-800">
              {loading
                ? "Cargando eventos..."
                : `${events.length} eventos visibles`}
            </span>
            {!loading ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {allEvents.length} total
              </span>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-2 sm:max-w-2xl sm:flex-row">
            <div className="flex-1">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar actividad, responsable o componente"
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                {availableAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-2 text-sm text-slate-500">
              <span>Componentes destacados:</span>
              <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                {componentOptions.map((component) => {
                  const Icon = componentIcons[component] ?? CalendarDays
                  return (
                    <Badge
                      key={component}
                      className="flex shrink-0 items-center gap-2 bg-slate-100 text-slate-700"
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                      <span className="whitespace-nowrap">{component}</span>
                    </Badge>
                  )
                })}
              </div>
            </div>
            {loadError ? (
              <p className="text-xs text-amber-600">{loadError}</p>
            ) : null}
          </CardHeader>
          <CardContent className="p-0">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locale={esLocale}
              firstDay={1}
              dayHeaderFormat={{ weekday: "long" }}
              initialView={currentView}
              height="auto"
              headerToolbar={false}
              events={events}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              datesSet={(info) => setCalendarTitle(info.view.title)}
              dayMaxEvents={3}
              moreLinkText="más"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              nowIndicator
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Próximas actividades
                </h2>
                <p className="text-sm text-slate-500">
                  Vista rápida de lo que viene en las próximas fechas.
                </p>
              </div>
              <Badge variant="secondary">
                {upcomingEvents.length} próximas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-6">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay actividades próximas registradas.
              </p>
            ) : (
              upcomingEvents.map((event) => {
                const TipoIcon = getTipoIcon(event.extendedProps.tipo)
                return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleEventClick({ event })}
                  className={`group flex w-full flex-col gap-3 rounded-2xl border bg-gradient-to-br from-white via-white to-brand-50/50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg ${getPriorityStyle(
                    event.extendedProps.prioridad
                  )}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <TipoIcon className="h-5 w-5 text-slate-400" />
                        <span className="break-words">{event.title}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {formatDateOnly(event.start)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {formatShortTime(event.start)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          Resp.: {event.extendedProps.responsable}
                        </span>
                      </div>
                    </div>
                    <Badge className={getComponentColor(event.extendedProps.area)}>
                      {getAreaLabel(event.extendedProps.area)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 px-2 py-1">
                      Tipo: {event.extendedProps.tipo}
                    </span>
                    <span className="rounded-full border border-slate-200 px-2 py-1">
                      Prioridad: {event.extendedProps.prioridad || "Media"}
                    </span>
                    {event.extendedProps.enlace ? (
                      <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-brand-700">
                        Presentación disponible
                      </span>
                    ) : null}
                  </div>
                  {event.extendedProps.enlace ? (
                    <div className="mt-1">
                      <Button asChild size="sm" className="shadow-sm">
                        <a
                          href={event.extendedProps.enlace}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver presentación
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </button>
              )})
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Resumen semanal
                </h2>
                <p className="text-sm text-slate-500">
                  Conteo diario y actividades destacadas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Próximos 7 días</Badge>
                <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => scrollWeekly("prev")}
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => scrollWeekly("next")}
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div
              ref={weeklyScrollRef}
              className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
            >
              {weeklySummary.map((day) => (
                <div
                  key={day.key}
                  className="w-72 shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDateOnly(day.date)}
                    </p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {day.items.length} actividades
                    </span>
                  </div>
                  {day.items.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Sin actividades registradas.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      {day.items.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => handleEventClick({ event })}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 hover:border-brand-200"
                        >
                          <span className="truncate">
                            {formatShortTime(event.start)} · {event.title}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            {getPrimaryArea(event.extendedProps.area)}
                          </span>
                        </button>
                      ))}
                      {day.items.length > 3 ? (
                        <span className="text-xs text-slate-400">
                          +{day.items.length - 3} más
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Agenda de hoy
                </h2>
                <p className="text-sm text-slate-500">
                  {formatDateOnly(new Date())}
                </p>
              </div>
              <Badge variant="secondary">{todayEvents.length} actividades</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-6">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay actividades registradas para hoy.
              </p>
            ) : (
              todayEvents.map((event) => {
                const TipoIcon = getTipoIcon(event.extendedProps.tipo)
                return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleEventClick({ event })}
                  className={`group flex w-full flex-col gap-3 rounded-2xl border bg-gradient-to-br from-white via-white to-brand-50/50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg ${getPriorityStyle(
                    event.extendedProps.prioridad
                  )}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <TipoIcon className="h-5 w-5 text-slate-400" />
                        <span className="break-words">{event.title}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {formatShortTime(event.start)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          Resp.: {event.extendedProps.responsable}
                        </span>
                      </div>
                    </div>
                    <Badge className={getComponentColor(event.extendedProps.area)}>
                      {getAreaLabel(event.extendedProps.area)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 px-2 py-1">
                      Tipo: {event.extendedProps.tipo}
                    </span>
                    <span className="rounded-full border border-slate-200 px-2 py-1">
                      Prioridad: {event.extendedProps.prioridad || "Media"}
                    </span>
                    {event.extendedProps.enlace ? (
                      <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-brand-700">
                        Presentación disponible
                      </span>
                    ) : null}
                  </div>
                  {event.extendedProps.enlace ? (
                    <div className="mt-1">
                      <Button asChild size="sm" className="shadow-sm">
                        <a
                          href={event.extendedProps.enlace}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver presentación
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </button>
              )})
            )}
          </CardContent>
        </Card>

        {!isKioskMode ? (
          <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Registrar nueva actividad
                </h2>
                <p className="text-sm text-slate-500">
                  Completa los campos clave y guarda. Puedes exportar el CSV en
                  formato claro para Excel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handlePreviewCsv}>
                  Vista previa CSV
                </Button>
                <Button variant="outline" onClick={handleExportCsv}>
                  <Download className="h-4 w-4" />
                  Descargar CSV
                </Button>
                <Button variant="outline" onClick={handleExportXlsx}>
                  Exportar Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            {formError ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {formError}
              </p>
            ) : null}
            {formSuccess ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {formSuccess}
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Fecha
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(event) =>
                    handleFormChange("fecha", event.target.value)
                  }
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400">
                  Obligatoria
                </span>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Hora
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(event) =>
                    handleFormChange("hora", event.target.value)
                  }
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400">
                  Opcional (por defecto 09:00)
                </span>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Actividad
                <input
                  type="text"
                  value={formData.actividad}
                  onChange={(event) =>
                    handleFormChange("actividad", event.target.value)
                  }
                  placeholder="Ej. Mesa de ayuda"
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400">
                  Obligatoria
                </span>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Tipo de actividad
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={(event) =>
                    handleFormChange("tipo", event.target.value)
                  }
                  placeholder="Ej. Reunión, Capacitación"
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400">
                  Opcional, describe el tipo general
                </span>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Prioridad
                <select
                  value={formData.prioridad}
                  onChange={(event) =>
                    handleFormChange("prioridad", event.target.value)
                  }
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
                <span className="text-xs text-slate-400">
                  Controla el estilo visual de la tarjeta
                </span>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Área responsable (Componentes)
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Selecciona uno o varios componentes</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleFormChange("area", componentOptions)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50"
                      >
                        Seleccionar todos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormChange("area", [])}
                        className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50"
                      >
                        Limpiar selección
                      </button>
                    </div>
                  </div>
                  {formData.area.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.area.map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {componentOptions.map((component) => {
                      const checked = formData.area.includes(component)
                      return (
                        <label
                          key={component}
                          className={`flex items-center gap-2 rounded-md border px-2 py-2 text-sm transition ${
                            checked
                              ? "border-brand-300 bg-brand-50 text-brand-900"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...formData.area, component]
                                : formData.area.filter(
                                    (item) => item !== component
                                  )
                              handleFormChange("area", next)
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span>{component}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Descripción
              <textarea
                rows={4}
                value={formData.descripcion}
                onChange={(event) =>
                  handleFormChange("descripcion", event.target.value)
                }
                placeholder="Detalles clave de la actividad"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Responsable
                <input
                  type="text"
                  value={formData.responsable}
                  onChange={(event) =>
                    handleFormChange("responsable", event.target.value)
                  }
                  placeholder="Nombre de la persona"
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Enlace
                <input
                  type="url"
                  value={formData.enlace}
                  onChange={(event) =>
                    handleFormChange("enlace", event.target.value)
                  }
                  placeholder="https://"
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                onClick={handleAddEvent}
                disabled={isSaving || !formData.fecha || !formData.actividad}
                className="w-full sm:w-auto"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                {editingEventId ? "Actualizar actividad" : "Guardar actividad"}
              </Button>
              <Button
                variant="ghost"
                onClick={resetForm}
                className="w-full sm:w-auto"
              >
                Limpiar
              </Button>
              {editingEventId ? (
                <Button
                  variant="outline"
                  onClick={() => setEditingEventId(null)}
                  className="w-full sm:w-auto"
                >
                  Cancelar edición
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
        ) : null}

        {!isKioskMode ? (
          <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Gestión de actividades
                </h2>
                <p className="text-sm text-slate-500">
                  Edita o elimina actividades almacenadas en el backend.
                </p>
              </div>
              <Badge variant="outline">
                {apiConfig.baseUrl ? "API activa" : "API no configurada"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            {!apiConfig.baseUrl ? (
              <p className="text-sm text-slate-500">
                Configura `VITE_EVENTS_API` en `frontend/.env` para habilitar
                edición y eliminación desde la API.
              </p>
            ) : (
              <div className="grid gap-3">
                {eventsData.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay actividades registradas en el backend.
                  </p>
                ) : (
                  eventsData.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {event.extendedProps.fecha} ·{" "}
                          {event.extendedProps.hora}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>Tipo: {event.extendedProps.tipo}</span>
                          <span>Área: {event.extendedProps.area}</span>
                          <span>
                            Responsable: {event.extendedProps.responsable}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditEvent(event)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={isDeleting}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
        ) : null}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Detalle de actividad</SheetTitle>
            <SheetDescription>
              Información completa y enlaces relevantes.
            </SheetDescription>
            {presentationActive ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                Presentación en curso · {formatDateOnly(selectedEvent?.start || new Date())}
              </div>
            ) : null}
          </SheetHeader>

          {selectedEvent ? (
            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        areaStyles[getPrimaryArea(selectedEvent.extendedProps.area)] ??
                        "bg-brand-700 text-white"
                      }
                    >
                      {getAreaLabel(selectedEvent.extendedProps.area)}
                    </Badge>
                    <Badge
                      className={
                        typeStyles[selectedEvent.extendedProps.tipo] ??
                        "bg-brand-700 text-white"
                      }
                    >
                      {selectedEvent.extendedProps.tipo}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedEvent.extendedProps.descripcion}
                </p>
              </div>

              <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Fecha
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDateOnly(selectedEvent.start)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Hora
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedEvent.extendedProps.hora}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Responsable
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedEvent.extendedProps.responsable}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Área
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {getAreaLabel(selectedEvent.extendedProps.area)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Inicio - Fin
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDateTime(selectedEvent.start)} ·{" "}
                    {formatDateTime(selectedEvent.end)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Enlace
                </p>
                {selectedEvent.extendedProps.enlace ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button asChild>
                      <a
                        href={selectedEvent.extendedProps.enlace}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Presentación
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href={selectedEvent.extendedProps.enlace}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir enlace
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Sin enlace asociado.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              Selecciona un evento para ver el detalle.
            </p>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={showCsvPreview} onOpenChange={setShowCsvPreview}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Vista previa CSV</SheetTitle>
            <SheetDescription>
              Revisa el archivo antes de descargarlo. Separador: punto y coma.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-4">
            <textarea
              readOnly
              value={csvPreview}
              className="h-[60vh] w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportCsv}>
                Descargar CSV
              </Button>
              <Button variant="outline" onClick={handleExportXlsx}>
                Exportar Excel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
