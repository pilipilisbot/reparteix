import { useState } from 'react'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import type { Group } from '../../domain/entities'
import { useStore } from '../../store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface LiquidationListProps {
  group: Group
}

export function LiquidationList({ group }: LiquidationListProps) {
  const { liquidations, createLiquidation, deleteLiquidation } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [periodType, setPeriodType] = useState('all')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const activeLiquidations = liquidations.filter((l) => l.groupId === group.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const symbol = group.currency

  const getMemberName = (id: string) => group.members.find((m) => m.id === id)?.name ?? 'Desconegut'

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const start = periodType === 'custom' && periodStart ? periodStart : undefined
    const end = periodType === 'custom' && periodEnd ? periodEnd : undefined

    await createLiquidation({
      groupId: group.id,
      name: name.trim(),
      periodStart: start,
      periodEnd: end,
    })

    setName('')
    setPeriodType('all')
    setPeriodStart('')
    setPeriodEnd('')
    setShowForm(false)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      {!showForm ? (
        !group.archived && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nou tancament
          </Button>
        )
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tancar període</CardTitle>
            <CardDescription>Genera una liquidació immutable amb els balanços actuals.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nom del tancament</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Febrer 2026, Viatge..." required />
              </div>
              <div className="space-y-1.5">
                <Label>Període</Label>
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tot l'històric (des de l'inici fins avui)</SelectItem>
                    <SelectItem value="custom">Dates personalitzades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {periodType === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Des de</Label>
                    <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fins a</Label>
                    <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Generar liquidació
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel·lar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeLiquidations.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No hi ha cap liquidació tancada.</p>
      ) : (
        <div className="space-y-4">
          {activeLiquidations.map((liq) => (
            <Card key={liq.id} className="border-indigo-100 bg-indigo-50/30 dark:border-indigo-900 dark:bg-indigo-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-indigo-900 dark:text-indigo-200">{liq.name}</CardTitle>
                  {!group.archived && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar liquidació</AlertDialogTitle>
                          <AlertDialogDescription>Estàs segur que vols esborrar aquest tancament? No afectarà les despeses ni els pagaments, només s'esborrarà aquest resum.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteLiquidation(liq.id)} className="bg-destructive text-white hover:bg-destructive/90">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <CardDescription>
                  {formatDate(liq.createdAt)} {liq.periodStart ? ` • Del ${formatDate(liq.periodStart)}` : ''} {liq.periodEnd ? `al ${formatDate(liq.periodEnd)}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resum</p>
                  <p className="text-sm">Total gastat: <span className="font-semibold">{liq.totalSpent.toFixed(2)} {symbol}</span></p>
                </div>
                
                {Object.keys(liq.balances).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Balanços</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(liq.balances).map(([id, total]) => {
                        if (Math.abs(total) < 0.01) return null
                        return (
                          <div key={id} className="flex justify-between p-1.5 rounded bg-background border">
                            <span className="truncate mr-2">{getMemberName(id)}</span>
                            <span className={cn('font-medium whitespace-nowrap', total > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                              {total > 0 ? '+' : ''}{total.toFixed(2)} {symbol}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {liq.transfers.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Com quadrar els comptes</p>
                    <div className="space-y-2">
                      {liq.transfers.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-md border bg-amber-50/50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{getMemberName(s.fromId)}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getMemberName(s.toId)}</span>
                          </div>
                          <Badge variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-semibold bg-white dark:bg-black">
                            {s.amount.toFixed(2)} {symbol}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-success font-medium">No calen transferències, el grup està equilibrat.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
