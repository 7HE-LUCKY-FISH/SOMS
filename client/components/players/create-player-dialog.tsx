'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Upload } from 'lucide-react'
import { apiCreatePlayerWithPhoto } from '@/lib/api'

interface CreatePlayerDialogProps {
  onPlayerCreated?: () => void
}

export function CreatePlayerDialog({ onPlayerCreated }: CreatePlayerDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    salary: '',
    positions: '',
    transfer_value: '',
    contract_end_date: '',
    is_active: true,
    is_injured: false,
    scouted_player: false
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file (PNG, JPG, JPEG, GIF, WebP)",
          variant: "destructive"
        })
        return
      }


      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.salary || !formData.contract_end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, Salary, Contract End Date)",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const form = new FormData()
      form.append('first_name', formData.first_name)
      if (formData.middle_name) form.append('middle_name', formData.middle_name)
      form.append('last_name', formData.last_name)
      form.append('salary', formData.salary)
      if (formData.positions) form.append('positions', formData.positions)
      form.append('is_active', String(formData.is_active))
      form.append('is_injured', String(formData.is_injured))
      if (formData.transfer_value) form.append('transfer_value', formData.transfer_value)
      form.append('contract_end_date', formData.contract_end_date)
      form.append('scouted_player', String(formData.scouted_player))
      if (photoFile) form.append('file', photoFile)

      await apiCreatePlayerWithPhoto(form)

      toast({
        title: "Success",
        description: "Player created successfully!",
      })

      // Reset form
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        salary: '',
        positions: '',
        transfer_value: '',
        contract_end_date: '',
        is_active: true,
        is_injured: false,
        scouted_player: false
      })
      setPhotoFile(null)
      setPhotoPreview(null)
      setOpen(false)
      
      if (onPlayerCreated) {
        onPlayerCreated()
      }
    } catch (error) {
      console.error('Error creating player:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create player",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          Create Player
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Player</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Player Photo</Label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="size-24 rounded-lg overflow-hidden border">
                  <img src={photoPreview} alt="Preview" className="size-full object-cover" />
                </div>
              ) : (
                <div className="size-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                  <Upload className="size-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a player photo (PNG, JPG, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="positions">Position</Label>
            <Select value={formData.positions} onValueChange={(value) => setFormData({ ...formData, positions: value })}>
              <SelectTrigger id="positions">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                <SelectItem value="RB">Right Back (RB)</SelectItem>
                <SelectItem value="LB">Left Back (LB)</SelectItem>
                <SelectItem value="CB">Center Back (CB)</SelectItem>
                <SelectItem value="CDM">Defensive Midfielder (CDM)</SelectItem>
                <SelectItem value="CM">Central Midfielder (CM)</SelectItem>
                <SelectItem value="CAM">Attacking Midfielder (CAM)</SelectItem>
                <SelectItem value="RM">Right Midfielder (RM)</SelectItem>
                <SelectItem value="LM">Left Midfielder (LM)</SelectItem>
                <SelectItem value="RW">Right Winger (RW)</SelectItem>
                <SelectItem value="LW">Left Winger (LW)</SelectItem>
                <SelectItem value="ST">Striker (ST)</SelectItem>
                <SelectItem value="CF">Center Forward (CF)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary *</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer_value">Transfer Value</Label>
              <Input
                id="transfer_value"
                type="number"
                step="0.01"
                value={formData.transfer_value}
                onChange={(e) => setFormData({ ...formData, transfer_value: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract_end_date">Contract End Date *</Label>
            <Input
              id="contract_end_date"
              type="date"
              value={formData.contract_end_date}
              onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
              required
            />
          </div>

          {/* Status Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="size-4"
              />
              <span className="text-sm">Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_injured}
                onChange={(e) => setFormData({ ...formData, is_injured: e.target.checked })}
                className="size-4"
              />
              <span className="text-sm">Injured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.scouted_player}
                onChange={(e) => setFormData({ ...formData, scouted_player: e.target.checked })}
                className="size-4"
              />
              <span className="text-sm">Scouted Player</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Player'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
