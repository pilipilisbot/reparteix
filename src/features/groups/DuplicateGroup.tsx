import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Plus, X, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '../../store'

const EMOJI_SHORTCUTS = [
  '🏖️', '🍕', '✈️', '🏠', '🎉', '🏕️', '🍺', '🎵', '⚽', '💼',
  '🎒', '🚗', '🎄', '🌍', '🏋️', '🍣', '🎓', '🛒', '🎸', '🏔️',
]

const MAX_ICON_LENGTH = 4

interface DraftMember {
  id: string
  name: string
  color?: string
}

function buildDraftId(): string {
  return crypto.randomUUID()
}

export function DuplicateGroup() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { groups, loadGroups, duplicateGroup } = useStore()

  const sourceGroup = useMemo(
    () => groups.find((group) => group.id === groupId),
    [groups, groupId],
  )

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [members, setMembers] = useState<DraftMember[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  useEffect(() => {
    if (!sourceGroup) return
    setName(`${sourceGroup.name} (còpia)`)
    setDescription(sourceGroup.description ?? '')
    setIcon(sourceGroup.icon ?? '')
    setCurrency(sourceGroup.currency)
    setMembers(
      sourceGroup.members
        .filter((member) => !member.deleted)
        .map((member) => ({
          id: buildDraftId(),
          name: member.name,
          color: member.color,
        })),
    )
  }, [sourceGroup])

  const updateMember = (memberId: string, nextName: string) => {
    setMembers((current) => current.map((member) => (
      member.id === memberId ? { ...member, name: nextName } : member
    )))
  }

  const removeMember = (memberId: string) => {
    setMembers((current) => current.filter((member) => member.id !== memberId))
  }

  const addMember = () => {
    setMembers((current) => [...current, { id: buildDraftId(), name: '' }])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupId || !sourceGroup) return

    const cleanedMembers = members
      .map((member) => ({ name: member.name.trim(), color: member.color }))
      .filter((member) => member.name.length > 0)

    if (!name.trim()) {
      setError('Cal un nom per al nou grup.')
      return
    }

    if (cleanedMembers.length === 0) {
      setError('Cal almenys un membre per crear la còpia.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const group = await duplicateGroup(groupId, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        currency,
        members: cleanedMembers,
      })
      navigate(`/group/${group.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No s\'ha pogut duplicar el grup.')
      setSaving(false)
    }
  }

  if (!sourceGroup) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-muted-foreground">Carregant...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/group/${groupId}/settings`)}
          aria-label="Tornar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Duplicar grup</h1>
          <p className="text-sm text-muted-foreground">
            Parteix de &quot;{sourceGroup.name}&quot; amb membres i configuració, però sense activitat econòmica prèvia.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Configuració inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Icona</Label>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl shrink-0">
                  {icon || '👥'}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Escriu un emoji…"
                    maxLength={MAX_ICON_LENGTH}
                  />
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_SHORTCUTS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className="text-lg hover:bg-muted rounded px-1 py-0.5 transition-colors"
                        aria-label={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duplicate-group-name">Nom</Label>
              <Input
                id="duplicate-group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom del nou grup"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duplicate-group-description">
                Descripció <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="duplicate-group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Per a qui és aquest grup?"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duplicate-group-currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="duplicate-group-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR €</SelectItem>
                  <SelectItem value="USD">USD $</SelectItem>
                  <SelectItem value="GBP">GBP £</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membres que es copiaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: member.color ?? '#6366f1' }}
                  aria-hidden="true"
                />
                <Input
                  value={member.name}
                  onChange={(e) => updateMember(member.id, e.target.value)}
                  placeholder="Nom del membre"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMember(member.id)}
                  aria-label="Eliminar membre de la còpia"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addMember} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Afegir membre
            </Button>
            <p className="text-sm text-muted-foreground">
              La còpia es crea neta: no s'hi traslladen despeses, pagaments ni historial.
            </p>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={saving}>
          <Check className="h-4 w-4 mr-2" />
          {saving ? 'Creant còpia…' : 'Crear grup a partir d\'aquest'}
        </Button>
      </form>
    </div>
  )
}
