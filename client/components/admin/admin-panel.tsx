'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Upload } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'coach' | 'medical' | 'player' | 'admin'
  status: 'active' | 'inactive'
}

const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@soms.app', role: 'admin', status: 'active' },
  { id: '2', name: 'Coach Smith', email: 'coach@soms.app', role: 'coach', status: 'active' },
  { id: '3', name: 'Dr. Johnson', email: 'medical@soms.app', role: 'medical', status: 'active' },
  { id: '4', name: 'Player One', email: 'player@soms.app', role: 'player', status: 'active' },
]

export function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: User['role']) => {
    const colors = {
      admin: 'bg-warning/20 text-warning-foreground border-warning/30',
      coach: 'bg-primary/20 text-primary border-primary/30',
      medical: 'bg-accent/20 text-accent-foreground border-accent/30',
      player: 'bg-info/20 text-info-foreground border-info/30',
    }
    return colors[role]
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, settings, and organization data.</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="data">Data Import</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button>
              <Plus className="size-4 mr-2" />
              Invite User
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">{user.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border capitalize ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                          user.status === 'active' 
                            ? 'bg-accent/20 text-accent-foreground border-accent/30' 
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Deactivate</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-6">Organization Settings</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" placeholder="My Soccer Club" defaultValue="SOMS Demo Club" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="season">Current Season</Label>
                <Input id="season" placeholder="2025" defaultValue="2025" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST</SelectItem>
                    <SelectItem value="pst">PST</SelectItem>
                    <SelectItem value="cet">CET</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stadium">Home Stadium</Label>
                <Input id="stadium" placeholder="Stadium name" defaultValue="Home Stadium" />
              </div>

              <Button>Save Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Import Players</h3>
                  <p className="text-sm text-muted-foreground">Upload a CSV file with player data</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="size-4 mr-2" />
                Choose File
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="size-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Upload className="size-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Import Matches</h3>
                  <p className="text-sm text-muted-foreground">Upload a CSV file with match fixtures</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="size-4 mr-2" />
                Choose File
              </Button>
            </Card>
          </div>

          <Card className="p-6 mt-6">
            <h3 className="font-semibold text-foreground mb-4">Import Instructions</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>CSV files should include the following columns:</p>
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Players CSV:</p>
                  <p>name, number, position, team, nationality, age, height, weight</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Matches CSV:</p>
                  <p>opponent, competition, venue, date, time</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
