import { useEffect, useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { Aircraft, MaintenanceItem } from '../../types/maintenance'
import { copyToClipboard, formatWhatsAppSummary } from '../../utils/whatsappFormat'

export function ExportButton({
  aircraft,
  items,
}: {
  aircraft: Aircraft | undefined
  items: MaintenanceItem[]
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2500)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function exportSummary() {
    if (!aircraft) return
    const ok = await copyToClipboard(formatWhatsAppSummary(aircraft, items))
    setCopied(ok)
  }

  return (
    <Button
      variant={copied ? 'primary' : 'secondary'}
      onClick={() => void exportSummary()}
      disabled={!aircraft}
      title="Copiar resumo formatado para WhatsApp"
    >
      {copied ? <Check size={17} /> : <Share2 size={17} />}
      {copied ? 'Copiado!' : 'Exportar WhatsApp'}
    </Button>
  )
}
