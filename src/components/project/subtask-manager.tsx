import React, { useState } from "react"
import { Plus, Check, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

interface SubTask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

interface SubTaskManagerProps {
  subtasks: SubTask[]
  onAddSubtask: (title: string) => void
  onToggleSubtask: (id: string) => void
  onDeleteSubtask: (id: string) => void
  onUpdateSubtask: (id: string, title: string) => void
}

export function SubTaskManager({
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtask
}: SubTaskManagerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(newSubtaskTitle.trim())
      setNewSubtaskTitle("")
    }
  }

  const handleStartEdit = (subtask: SubTask) => {
    setEditingId(subtask.id)
    setEditingTitle(subtask.title)
  }

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      onUpdateSubtask(editingId, editingTitle.trim())
      setEditingId(null)
      setEditingTitle("")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const completedCount = subtasks.filter(st => st.completed).length
  const totalCount = subtasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Sub-tarefas</h4>
            <div className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} ({progressPercentage}%)
            </div>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Subtasks List */}
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded-lg">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtask(subtask.id)}
                />
                
                {editingId === subtask.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <span 
                      className={`cursor-pointer ${
                        subtask.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                      onClick={() => handleStartEdit(subtask)}
                    >
                      {subtask.title}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDeleteSubtask(subtask.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Subtask */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Adicionar sub-tarefa..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtask()
              }}
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}