import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { inputClass } from '../../components/ui/styles'
import { useMaintenance } from '../../hooks/useMaintenance'
import {
  CATEGORY_LABELS,
  DISCREPANCY_STATUS_LABELS,
  ITEM_CATEGORIES,
  LOAN_DIRECTION_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  THIRD_PARTY_STATUS_LABELS,
  type ItemCategory,
  type MaintenanceItem,
  type MaintenancePhase,
} from '../../types/maintenance'
import { createId } from '../../utils/id'
import {
  emptyFormValues,
  formValuesFromItem,
  itemFormSchema,
  itemFromFormValues,
  type ItemFormValues,
} from './itemSchema'

export function ItemFormModal({
  open,
  item,
  aircraftId,
  phases,
  onClose,
}: {
  open: boolean
  item: MaintenanceItem | null
  aircraftId: string
  phases: MaintenancePhase[]
  onClose: () => void
}) {
  const { saveItem } = useMaintenance()
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: item
      ? formValuesFromItem(item)
      : emptyFormValues('DISCREPANCY', phases[0]?.id ?? ''),
  })

  const category = watch('category')
  const triggerType = watch('triggerType')
  const lastCategory = useRef<ItemCategory>(category)

  useEffect(() => {
    if (lastCategory.current === category) return
    lastCategory.current = category
    const current = getValues()
    reset({
      ...emptyFormValues(category, current.phaseId),
      title: current.title,
      notes: current.notes,
    })
  }, [category, getValues, reset])

  const submit = handleSubmit(async (values) => {
    const now = new Date().toISOString()
    const nextItem = itemFromFormValues(values, {
      id: item?.id ?? createId('item'),
      aircraftId,
      createdAt: item?.createdAt ?? now,
    })
    await saveItem(nextItem)
    onClose()
  })

  return (
    <Modal
      open={open}
      title={item ? 'Editar item' : 'Novo item de manutenção'}
      description="Os campos variam conforme a categoria selecionada."
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            form="item-form"
            variant="primary"
            disabled={isSubmitting}
          >
            <Save size={17} /> {isSubmitting ? 'Salvando...' : 'Salvar item'}
          </Button>
        </div>
      }
    >
      <form id="item-form" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria">
            <select className={inputClass} {...register('category')}>
              {ITEM_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fase de manutenção" error={errors.phaseId?.message}>
            <select className={inputClass} {...register('phaseId')}>
              {phases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Título" error={errors.title?.message}>
          <input
            className={inputClass}
            placeholder="Descreva o item encontrado"
            {...register('title')}
          />
        </Field>

        <Field label="Observações">
          <textarea
            className={`${inputClass} min-h-20 resize-y`}
            placeholder="Detalhes, histórico ou instruções"
            {...register('notes')}
          />
        </Field>

        {category === 'DISCREPANCY' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" error={errors.status?.message}>
              <select className={inputClass} {...register('status')}>
                {Object.entries(DISCREPANCY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Medição (ex: 12 mm)">
              <input className={inputClass} {...register('measurement')} />
            </Field>
            <Field label="Referência do manual" error={errors.manualRef?.message}>
              <input
                className={inputClass}
                placeholder="Bell 407 MM 52-10-01"
                {...register('manualRef')}
              />
            </Field>
            <Field label="Prazo">
              <input type="date" className={inputClass} {...register('dueDate')} />
            </Field>
          </div>
        ) : null}

        {category === 'TASK' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" error={errors.status?.message}>
              <select className={inputClass} {...register('status')}>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prioridade" error={errors.priority?.message}>
              <select className={inputClass} {...register('priority')}>
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Responsável" error={errors.responsible?.message}>
              <input
                className={inputClass}
                placeholder="Equipe ou mecânico responsável"
                {...register('responsible')}
              />
            </Field>
            <Field label="Prazo">
              <input type="date" className={inputClass} {...register('dueDate')} />
            </Field>
          </div>
        ) : null}

        {category === 'LOAN_MATERIAL' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Direção" error={errors.direction?.message}>
              <select className={inputClass} {...register('direction')}>
                {Object.entries(LOAN_DIRECTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Part number" error={errors.partNumber?.message}>
              <input
                className={inputClass}
                placeholder="206-064-101-1"
                {...register('partNumber')}
              />
            </Field>
            <Field label="Serial number">
              <input className={inputClass} {...register('serialNumber')} />
            </Field>
            <Field
              label="Aeronave relacionada"
              error={errors.relatedAircraftPrefix?.message}
              hint="Prefixo de origem ou destino, ex: PR-GMD"
            >
              <input
                className={inputClass}
                placeholder="PS-GMD"
                {...register('relatedAircraftPrefix')}
              />
            </Field>
            <Field label="Previsão de retorno">
              <input
                type="date"
                className={inputClass}
                {...register('expectedReturnDate')}
              />
            </Field>
            <label className="flex min-h-11 items-center gap-3 self-end rounded-lg bg-slate-50 px-3 dark:bg-slate-800/60">
              <input
                type="checkbox"
                className="size-5 accent-sky-600"
                {...register('returned')}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Peça já devolvida
              </span>
            </label>
          </div>
        ) : null}

        {category === 'THIRD_PARTY' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fornecedor / Oficina" error={errors.provider?.message}>
              <input
                className={inputClass}
                placeholder="Nome da oficina"
                {...register('provider')}
              />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <select className={inputClass} {...register('status')}>
                {Object.entries(THIRD_PARTY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data de envio" error={errors.sentDate?.message}>
              <input type="date" className={inputClass} {...register('sentDate')} />
            </Field>
            <Field label="Previsão de retorno">
              <input
                type="date"
                className={inputClass}
                {...register('expectedReturnDate')}
              />
            </Field>
          </div>
        ) : null}

        {category === 'TORQUE_CHECK' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valor aplicado" error={errors.torqueValue?.message}>
              <input
                className={inputClass}
                placeholder="160-200 in-lbs"
                {...register('torqueValue')}
              />
            </Field>
            <Field label="Referência técnica" error={errors.technicalRef?.message}>
              <input
                className={inputClass}
                placeholder="cf-2018-35"
                {...register('technicalRef')}
              />
            </Field>
            <Field label="Gatilho de vencimento">
              <select className={inputClass} {...register('triggerType')}>
                <option value="HOURS">Horas de voo (TSN)</option>
                <option value="DATE">Data</option>
              </select>
            </Field>
            {triggerType === 'HOURS' ? (
              <Field label="Vencimento (horas)" error={errors.dueHours?.message}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={inputClass}
                  placeholder="3255"
                  {...register('dueHours')}
                />
              </Field>
            ) : (
              <Field label="Data de vencimento" error={errors.dueDate?.message}>
                <input type="date" className={inputClass} {...register('dueDate')} />
              </Field>
            )}
            <label className="flex min-h-11 items-center gap-3 self-end rounded-lg bg-slate-50 px-3 dark:bg-slate-800/60">
              <input
                type="checkbox"
                className="size-5 accent-sky-600"
                {...register('acknowledged')}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Torque já conferido / registrado
              </span>
            </label>
          </div>
        ) : null}
      </form>
    </Modal>
  )
}
