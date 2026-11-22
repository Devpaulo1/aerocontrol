import { ArrowLeftRight } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { cardClass } from '../../components/ui/styles'
import type { Aircraft, LoanItem } from '../../types/maintenance'
import { formatDate } from '../../utils/date'

export function LoanCrossView({
  loans,
  aircrafts,
}: {
  loans: LoanItem[]
  aircrafts: Aircraft[]
}) {
  if (loans.length === 0) return null
  const prefixById = new Map(aircrafts.map((aircraft) => [aircraft.id, aircraft.prefix]))

  return (
    <section className="space-y-2" aria-label="Visão cruzada de empréstimos">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
        <ArrowLeftRight size={17} /> Visão cruzada entre aeronaves
      </h2>
      <div className="grid gap-2 md:grid-cols-2">
        {loans.map((loan) => {
          const currentPrefix = prefixById.get(loan.aircraftId) ?? '—'
          const related = loan.relatedAircraftPrefix ?? 'Não informado'
          const origin = loan.direction === 'OUTBOUND' ? currentPrefix : related
          const destination = loan.direction === 'OUTBOUND' ? related : currentPrefix
          return (
            <div key={loan.id} className={`${cardClass} p-3`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {origin} <span className="text-sky-600">→</span> {destination}
                </span>
                <Badge tone={loan.returned ? 'success' : 'warning'}>
                  {loan.returned ? 'Devolvido' : 'Em aberto'}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {loan.partNumber}
                {loan.serialNumber ? ` · SN ${loan.serialNumber}` : ''}
              </p>
              {loan.expectedReturnDate ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Previsão: {formatDate(loan.expectedReturnDate)}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
