import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react"

interface Column {
  id: string
  title: string
  tasks: any[]
}

interface ColumnManagerModalProps {
  columns: Column[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (columns: Column[]) => void
}

export function ColumnManagerModal({ columns, open, onOpenChange, onSave }: ColumnManagerModalProps) {
  const [editingColumns, setEditingColumns] = useState<Column[]>([])
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  useEffect(() => {
    if (open) {
      setEditingColumns([...columns])
    }
  }, [columns, open])

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn: Column = {
        id: Date.now().toString(),
        title: newColumnTitle.trim(),
        tasks: []
      }
      setEditingColumns(prev => [...prev, newColumn])
      setNewColumnTitle("")
    }
  }

  const handleEditColumn = (columnId: string, newTitle: string) => {
    setEditingColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { ...col, title: newTitle }
          : col
      )
    )
    setEditingId(null)
    setEditingTitle("")
  }

  const handleDeleteColumn = (columnId: string) => {
    const columnToDelete = editingColumns.find(col => col.id === columnId)
    if (columnToDelete && columnToDelete.tasks.length > 0) {
      if (!confirm(`A coluna "${columnToDelete.title}" possui ${columnToDelete.tasks.length} tarefa(s). Tem certeza que deseja excluí-la?`)) {
        return
      }
    }
    setEditingColumns(prev => prev.filter(col => col.id !== columnId))
  }

  const handleSave = () => {
    onSave(editingColumns)
    onOpenChange(false)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(editingColumns)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setEditingColumns(items)
  }

  const startEditing = (column: Column) => {
    setEditingId(column.id)
    setEditingTitle(column.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      action()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Gerenciar Colunas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Column */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Adicionar Nova Coluna</Label>
            <div className="flex gap-2">
              <Input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddColumn)}
                placeholder="Nome da nova coluna"
                className="flex-1"
              />
              <Button
                onClick={handleAddColumn}
                disabled={!newColumnTitle.trim()}
                className="bg-gradient-sunset text-white hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Existing Columns */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Colunas Existentes</Label>
            <p className="text-xs text-muted-foreground">Arraste as colunas para reordená-las</p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3 max-h-80 overflow-y-auto"
                  >
                    {editingColumns.map((column, index) => (
                      <Draggable key={column.id} draggableId={column.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 border rounded-lg bg-card transition-all ${
                              snapshot.isDragging ? "shadow-lg border-primary bg-primary/5" : ""
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            
                            {editingId === column.id ? (
                              <div className="flex-1 flex gap-2">
                                <Input
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyPress={(e) => handleKeyPress(e, () => handleEditColumn(column.id, editingTitle))}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleEditColumn(column.id, editingTitle)}
                                  disabled={!editingTitle.trim()}
                                  className="bg-gradient-sunset text-white hover:opacity-90"
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 flex items-center gap-2">
                                  <span className="font-medium text-foreground">{column.title}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {column.tasks.length} tarefa(s)
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditing(column)}
                                    className="hover-lift"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteColumn(column.id)}
                                    className="hover-lift"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-sunset text-white hover:opacity-90"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
