import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Loader2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { Button } from "./ui/button"

const parseDateTime = (fecha, hora) => {
  if (!fecha) return null
  const safeHora =
    hora && String(hora).trim().length > 0 ? String(hora).trim() : "09:00"
  const date = new Date(`${fecha}T${safeHora}:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const defaultFormData = {
  fecha: "",
  horaInicio: "09:00",
  horaFin: "10:00",
  actividad: "",
  descripcion: "",
  responsable: "",
  tipo: "",
  prioridad: "Media",
  area: [],
  enlace: "",
}

export default function FormCalendar({
  open,
  onOpenChange,
  onSubmit,
  initialData = null,
  editingEventId = null,
  componentOptions = [],
  isSaving: externalSaving = false,
}) {
  const [formData, setFormData] = useState(defaultFormData)
  const [formSuccess, setFormSuccess] = useState("")

  useEffect(() => {
    if (open) {
      setFormSuccess("")
      if (initialData && typeof initialData === "object") {
        setFormData({
          fecha: initialData.fecha ?? "",
          horaInicio: initialData.horaInicio ?? "09:00",
          horaFin: initialData.horaFin ?? "10:00",
          actividad: initialData.actividad ?? "",
          descripcion: initialData.descripcion ?? "",
          responsable: initialData.responsable ?? "",
          tipo: initialData.tipo ?? "",
          prioridad: initialData.prioridad ?? "Media",
          area: Array.isArray(initialData.area) ? initialData.area : [],
          enlace: initialData.enlace ?? "",
        })
      } else {
        setFormData({ ...defaultFormData })
      }
    }
  }, [open, initialData])

  const handleFormChange = (field, value) => {
    setFormSuccess("")
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormSuccess("")
    setFormData({ ...defaultFormData })
  }

  const handleSubmit = () => {
    setFormSuccess("")
    if (!formData.fecha || !formData.actividad) {
      toast.error("Fecha y actividad son obligatorias.")
      return
    }
    const start = parseDateTime(formData.fecha, formData.horaInicio)
    if (!start) {
      toast.error("Fecha u hora de inicio inválida.")
      return
    }

    const payload = {
      fecha: formData.fecha,
      hora_inicio: formData.horaInicio || "09:00",
      hora_final: formData.horaFin || "10:00",
      actividad: formData.actividad,
      descripcion: formData.descripcion || "Sin descripción.",
      responsable: formData.responsable || "Sin asignar",
      tipo: formData.tipo || "General",
      area: Array.isArray(formData.area) ? formData.area : [],
      enlace: formData.enlace || "",
    }
    if (editingEventId != null && editingEventId !== "") {
      payload.id = Number(editingEventId) || editingEventId
    }

    const result = onSubmit(payload, editingEventId)
    if (result && typeof result.then === "function") {
      result
        .then(() => {
          setFormSuccess(
            editingEventId
              ? "Actividad actualizada correctamente."
              : "Actividad guardada correctamente."
          )
          setTimeout(() => {
            handleClose(false)
          }, 1000)
        })
        .catch((err) => {
          toast.error(
            err?.message || "No se pudo guardar en el backend. Intenta de nuevo."
          )
        })
    } else {
      handleClose(false)
    }
  }

  const handleClose = (openState) => {
    if (!openState) resetForm()
    onOpenChange(openState)
  }

  const isSaving = externalSaving

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editingEventId ? "Editar actividad" : "Registrar nueva actividad"}
          </DialogTitle>
          <DialogDescription>
            Completa los campos y guarda. Los datos se envían al calendario CNE.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
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
                onChange={(e) => handleFormChange("fecha", e.target.value)}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-400">Obligatoria</span>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Hora inicio
              <input
                type="time"
                value={formData.horaInicio}
                onChange={(e) => handleFormChange("horaInicio", e.target.value)}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-400">Opcional (por defecto 09:00)</span>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Hora fin
              <input
                type="time"
                value={formData.horaFin}
                onChange={(e) => handleFormChange("horaFin", e.target.value)}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-400">Opcional (por defecto 10:00)</span>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Actividad
            <input
              type="text"
              value={formData.actividad}
              onChange={(e) => handleFormChange("actividad", e.target.value)}
              placeholder="Ej. Mesa de ayuda"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-xs text-slate-400">Obligatoria</span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Tipo de actividad
              <input
                type="text"
                value={formData.tipo}
                onChange={(e) => handleFormChange("tipo", e.target.value)}
                placeholder="Ej. Reunión, Capacitación"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Prioridad
              <select
                value={formData.prioridad}
                onChange={(e) => handleFormChange("prioridad", e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </label>
          </div>

          {componentOptions.length > 0 ? (
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Área responsable (Componentes)
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Selecciona uno o varios componentes</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleFormChange("area", [...componentOptions])}
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
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...formData.area, component]
                              : formData.area.filter((item) => item !== component)
                            handleFormChange("area", next)
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span>{component}</span>
                      </label>
                    )
                  })}
                </div>
                {formData.area.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.area.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </label>
          ) : null}

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Descripción
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => handleFormChange("descripcion", e.target.value)}
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
                onChange={(e) => handleFormChange("responsable", e.target.value)}
                placeholder="Nombre de la persona"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Enlace
              <input
                type="url"
                value={formData.enlace}
                onChange={(e) => handleFormChange("enlace", e.target.value)}
                placeholder="https://"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3 sm:items-center sm:justify-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !formData.fecha || !formData.actividad}
              className="flex items-center gap-2 border-slate-300 text-slate-600 bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSaving
                ? "Guardando..."
                : editingEventId
                  ? "Actualizar actividad"
                  : "Guardar actividad"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Limpiar
            </Button>
            {editingEventId ? (
              <Button
                type="button"
                variant="outline"
                className="border-rose-300 text-rose-600 hover:bg-rose-50"
                onClick={() => handleClose(false)}
              >
                Cancelar edición
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
