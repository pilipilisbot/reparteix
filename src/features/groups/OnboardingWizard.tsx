import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Plus, Shield, Sparkles, Users } from 'lucide-react'
import { useStore } from '../../store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Step = 1 | 2 | 3

interface DraftState {
  step: Step
  groupId: string | null
  groupName: string
  memberNames: string[]
  expenseDescription: string
  expenseAmount: string
  payerIndex: string
}

const STORAGE_KEY = 'reparteix:onboarding-draft:v1'

const DEFAULT_DRAFT: DraftState = {
  step: 1,
  groupId: null,
  groupName: '',
  memberNames: ['Tu', 'Anna', 'Bernat'],
  expenseDescription: 'Sopar',
  expenseAmount: '36',
  payerIndex: '0',
}

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { groups, addGroup, addMember, addExpense, loadGroups } = useStore()
  const [draft, setDraft] = useState<DraftState>(DEFAULT_DRAFT)
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setDraft({ ...DEFAULT_DRAFT, ...JSON.parse(stored) })
      }
    } catch {
      // ignore draft load failures
    } finally {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isReady) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      // ignore draft save failures
    }
  }, [draft, isReady])

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === draft.groupId),
    [groups, draft.groupId],
  )

  const members = activeGroup?.members.filter((member) => !member.deleted) ?? []

  const setStep = (step: Step) => setDraft((current) => ({ ...current, step }))

  const updateMemberName = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      memberNames: current.memberNames.map((name, i) => (i === index ? value : name)),
    }))
  }

  const addMemberField = () => {
    setDraft((current) => ({
      ...current,
      memberNames: [...current.memberNames, ''],
    }))
  }

  const removeMemberField = (index: number) => {
    setDraft((current) => ({
      ...current,
      memberNames: current.memberNames.filter((_, i) => i !== index),
      payerIndex:
        Number(current.payerIndex) >= current.memberNames.filter((_, i) => i !== index).length
          ? '0'
          : current.payerIndex,
    }))
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    const groupName = draft.groupName.trim()
    if (!groupName) return

    setIsSubmitting(true)
    try {
      const group = await addGroup(groupName)
      setDraft((current) => ({ ...current, groupId: group.id, step: 2 }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateMembers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.groupId) return

    const cleanNames = draft.memberNames.map((name) => name.trim()).filter(Boolean)
    if (cleanNames.length < 2) return

    setIsSubmitting(true)
    try {
      const existingNames = new Set(
        (groups.find((group) => group.id === draft.groupId)?.members ?? [])
          .filter((member) => !member.deleted)
          .map((member) => member.name.trim().toLowerCase()),
      )

      for (const name of cleanNames) {
        if (!existingNames.has(name.toLowerCase())) {
          await addMember(draft.groupId, name)
        }
      }

      await loadGroups()
      setDraft((current) => ({
        ...current,
        memberNames: cleanNames,
        payerIndex: String(Math.min(Number(current.payerIndex), cleanNames.length - 1)),
        step: 3,
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateFirstExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.groupId || members.length < 2) return

    const amount = parseFloat(draft.expenseAmount)
    const payer = members[Number(draft.payerIndex)]
    if (!draft.expenseDescription.trim() || !payer || Number.isNaN(amount) || amount <= 0) return

    setIsSubmitting(true)
    try {
      await addExpense({
        groupId: draft.groupId,
        description: draft.expenseDescription.trim(),
        amount,
        payerId: payer.id,
        splitAmong: members.map((member) => member.id),
        splitType: 'equal',
        date: new Date().toISOString().split('T')[0],
      })
      localStorage.removeItem(STORAGE_KEY)
      navigate(`/group/${draft.groupId}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canContinueMembers = draft.memberNames.map((name) => name.trim()).filter(Boolean).length >= 2
  const canContinueExpense = !!draft.expenseDescription.trim() && Number(draft.expenseAmount) > 0 && members.length >= 2

  if (!isReady) {
    return <div className="max-w-2xl mx-auto p-4">Carregant…</div>
  }

  return (
    <div className="min-h-screen bg-muted/50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tornar
          </Button>
          <div className="text-sm text-muted-foreground">Pas {draft.step} de 3</div>
        </div>

        <Card className="p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Crea un grup i veu el primer balanç en menys d’un minut</h1>
              <p className="text-muted-foreground">
                Reparteix et guia perquè entenguis el model ràpid: grup, membres, primera despesa i balanç.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Tot queda al teu dispositiu. No fem tracking ni enviem dades a tercers.
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2 text-sm">
          {[
            { step: 1, label: 'Grup' },
            { step: 2, label: 'Membres' },
            { step: 3, label: 'Primera despesa' },
          ].map((item) => (
            <div
              key={item.step}
              className={`rounded-xl border px-3 py-2 text-center ${draft.step === item.step ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300' : 'text-muted-foreground'}`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {draft.step === 1 && (
          <Card className="p-6">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <Label htmlFor="group-name">Com es diu el grup?</Label>
                <Input
                  id="group-name"
                  value={draft.groupName}
                  onChange={(e) => setDraft((current) => ({ ...current, groupName: e.target.value }))}
                  placeholder="Pis de Gràcia, Viatge a Mallorca, Sopars..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!draft.groupName.trim() || isSubmitting}>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </form>
          </Card>
        )}

        {draft.step === 2 && (
          <Card className="p-6">
            <form onSubmit={handleCreateMembers} className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Afegeix almenys 2 persones per veure com es reparteix.</p>
              </div>
              <div className="space-y-3">
                {draft.memberNames.map((memberName, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={memberName}
                      onChange={(e) => updateMemberName(index, e.target.value)}
                      placeholder={index === 0 ? 'Tu' : `Membre ${index + 1}`}
                    />
                    {draft.memberNames.length > 2 && (
                      <Button type="button" variant="ghost" onClick={() => removeMemberField(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addMemberField}>
                <Plus className="h-4 w-4 mr-1" />
                Afegir membre
              </Button>
              <div className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  Enrere
                </Button>
                <Button type="submit" disabled={!canContinueMembers || isSubmitting}>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </form>
          </Card>
        )}

        {draft.step === 3 && (
          <Card className="p-6">
            <form onSubmit={handleCreateFirstExpense} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="expense-description">Quina ha estat la primera despesa?</Label>
                <Input
                  id="expense-description"
                  value={draft.expenseDescription}
                  onChange={(e) => setDraft((current) => ({ ...current, expenseDescription: e.target.value }))}
                  placeholder="Sopar, compra, taxi..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="expense-amount">Import</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={draft.expenseAmount}
                    onChange={(e) => setDraft((current) => ({ ...current, expenseAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Qui ha pagat?</Label>
                  <Select value={draft.payerIndex} onValueChange={(value) => setDraft((current) => ({ ...current, payerIndex: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member, index) => (
                        <SelectItem key={member.id} value={String(index)}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Quan acabis:</p>
                <p>- tindràs el grup creat</p>
                <p>- la despesa ja estarà repartida entre tots</p>
                <p>- entraràs directament a la vista de balanç</p>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                  Enrere
                </Button>
                <Button type="submit" disabled={!canContinueExpense || isSubmitting}>
                  <Check className="h-4 w-4 mr-1" />
                  Veure balanç
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
