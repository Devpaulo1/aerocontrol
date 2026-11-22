import { useState } from 'react'
import { FileInput, Sparkles } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { inputClass } from '../../components/ui/styles'
import { useMaintenance } from '../../hooks/useMaintenance'
import { CATEGORY_LABELS, type MaintenancePhase } from '../../types/maintenance'
import { createId } from '../../utils/id'
import { parseKeepNote, type KeepParseResult } from '../../utils/keepParser'
import { draftToItem } from './draftToItem'

function draftDetails(draft: KeepParseResult['items'][number]): string {
  const details: string[] = []
  if (draft.partNumber) details.push(`PN ${draft.partNumber}`)
  if (draft.serialNumber) details.push(`SN ${draft.serialNumber}`)
  if (draft.relatedAircraftPrefix) details.push(draft.relatedAircraftPrefix)
  if (draft.torqueValue) details.push(draft.torqueValue)
  if (draft.technicalRef) details.push(draft.technicalRef)
  if (draft.measurement) details.push(draft.measurement)
  if (draft.manualRef) details.push(draft.manualRef)
  if (draft.provider) details.push(draft.provider)
  if (draft.dueHours !== undefined) details.push(`${draft.dueHours} h`)
  if (draft.dueDate) details.push(draft.dueDate)
  return details.join(' · ')
}

const EXAMPLE_NOTE = `Discrepância:
- Trinca de 12 mm na carenagem da porta, manual MM 52-10-01
- Vazamento de óleo no trem dianteiro, aguardando peça

Empréstimo:
- Palheta ventilador PN 206-064-101-1 SN 4471, recebido de PR-GMD, devolução 30/11/2026

Terceiros:
- Retifica do eixo, oficina AeroSul, enviado 14/11/2026, previsão 27/11/2026

Checks de torque:
- Torque do rotor principal 160-200 in-lbs, cf-2018-35, vencimento em 3255h`

export function ImportModal({
  open,
  aircraftId,
  phases,
  onClose,
}: {
  open: boolean
  aircraftId: string
  phases: MaintenancePhase[]
  onClose: () => void
}) {
  const { importItems } = useMaintenance()
  const [text, setText] = useState('')
  const [result, setResult] = useState<KeepParseResult | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [phaseId, setPhaseId] = useState(phases[0]?.id ?? '')
  const [saving, setSaving] = useState(false)

  function analyze() {
    const parsed = parseKeepNote(text)
    setResult(parsed)
    setSelected(new Set(parsed.items.map((_, index) => index)))
  }

  function toggle(index: number) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  async function confirm() {
    if (!result || selected.size === 0 || !phaseId) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const items = result.items
        .filter((_, index) => selected.has(index))
        .map((draft) =>
          draftToItem(draft, {
            id: createId('import'),
            aircraftId,
            phaseId,
            createdAt: now,
          }),
        )
      await importItems(items)
      setText('')
      setResult(null)
      setSelected(new Set())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Importar nota / lista"
      description="Cole o texto das notas antigas e confira o que foi reconhecido antes de salvar."
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => void confirm()}
            disabled={!result || selected.size === 0 || saving || !phaseId}
          >
            <FileInput size={17} />
            {saving ? 'Salvando...' : `Importar ${selected.size} item(ns)`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field
          label="Texto da nota"
          hint="Cabeçalhos reconhecidos: Discrepância, A efetuar, Empréstimo/Materiais, Terceiros, Atenção e Checks de torque."
        >
          <textarea
            className={`${inputClass} min-h-40 resize-y font-mono text-xs`}
            placeholder={EXAMPLE_NOTE}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={analyze} disabled={!text.trim()}>
            <Sparkles size={17} /> Analisar texto
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setText(EXAMPLE_NOTE)
              setResult(null)
            }}
          >
            Usar exemplo
          </Button>
        </div>

        {result ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {result.items.length} item(ns) reconhecido(s)
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                Fase de destino
                <select
                  className={`${inputClass} min-h-9 w-auto py-1 text-xs`}
                  value={phaseId}
                  onChange={(event) => setPhaseId(event.target.value)}
                >
                  {phases.map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {result.unmatched.length > 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                Linhas sem categoria identificada (ignoradas):{' '}
                {result.unmatched.join(' | ')}
              </p>
            ) : null}

            {result.items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Nenhum item foi reconhecido. Use um dos cabeçalhos sugeridos.
              </p>
            ) : (
              <ul className="grid gap-2">
                {result.items.map((draft, index) => {
                  const details = draftDetails(draft)
                  return (
                    <li key={`${draft.sourceLine}-${index}`}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60">
                        <input
                          type="checkbox"
                          checked={selected.has(index)}
                          onChange={() => toggle(index)}
                          className="mt-1 size-5 shrink-0 accent-sky-600"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge tone="info">
                              {CATEGORY_LABELS[draft.category]}
                            </Badge>
                            <span className="text-[10px] text-slate-400">
                              linha {draft.sourceLine}
                            </span>
                          </span>
                          <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {draft.title}
                          </span>
                          {details ? (
                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                              {details}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
