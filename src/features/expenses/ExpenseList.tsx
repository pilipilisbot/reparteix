import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Group } from '../../domain/entities'
import { useStore } from '../../store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

interface ExpenseListProps {
  group: Group
}

export function ExpenseList({ group }: ExpenseListProps) {
  const { expenses, addExpense, deleteExpense } = useStore()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState('')
  const [splitAmong, setSplitAmong] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)

  const activeMembers = group.members.filter((m) => !m.deleted)
  const symbol = CURRENCY_SYMBOLS[group.currency] ?? group.currency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount || !payerId || splitAmong.length === 0) return

    await addExpense({
      groupId: group.id,
      description: description.trim(),
      amount: parseFloat(amount),
      payerId,
      splitAmong,
      date: new Date().toISOString().split('T')[0],
    })

    setDescription('')
    setAmount('')
    setPayerId('')
    setSplitAmong([])
    setShowForm(false)
  }

  const toggleSplitMember = (memberId: string) => {
    setSplitAmong((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    )
  }

  const selectAllMembers = () => {
    setSplitAmong(activeMembers.map((m) => m.id))
  }

  const getMemberName = (id: string) =>
    group.members.find((m) => m.id === id)?.name ?? 'Desconegut'

  return (
    <div>
      {activeMembers.length < 2 ? (
        <p className="text-muted-foreground text-center py-4">
          Afegeix almenys 2 membres per poder crear despeses.
        </p>
      ) : (
        <>
          {!showForm ? (
            <Button
              onClick={() => {
                setShowForm(true)
                selectAllMembers()
              }}
              className="w-full mb-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova despesa
            </Button>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Nova despesa</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descripció (p.ex. Sopar)"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Import"
                      step="0.01"
                      min="0.01"
                      className="flex-1"
                      required
                    />
                    <span className="flex items-center text-muted-foreground">
                      {symbol}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Label>Qui ha pagat?</Label>
                    <Select value={payerId} onValueChange={setPayerId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Repartir entre:</Label>
                    <div className="flex flex-wrap gap-2">
                      {activeMembers.map((m) => (
                        <Button
                          key={m.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSplitMember(m.id)}
                          className={cn(
                            'rounded-full',
                            splitAmong.includes(m.id) &&
                              'bg-primary text-primary-foreground hover:bg-primary/90',
                          )}
                        >
                          {m.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Afegir despesa
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel·lar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {expenses.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Encara no hi ha despeses.
        </p>
      ) : (
        <div className="space-y-2">
          {expenses
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((expense) => (
              <Card key={expense.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {getMemberName(expense.payerId)} ha pagat · {expense.date}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      Repartit entre: {expense.splitAmong.map(getMemberName).join(', ')}
                    </div>
                  </div>
                  <div className="text-right ml-4 flex flex-col items-end gap-1">
                    <div className="font-semibold">
                      {expense.amount.toFixed(2)} {symbol}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteExpense(expense.id)}
                      className="h-auto px-1 py-0 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
