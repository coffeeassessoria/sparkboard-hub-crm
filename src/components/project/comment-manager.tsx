import React, { useState } from "react"
import { Send, Edit, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  edited?: boolean
  editedAt?: string
}

interface CommentManagerProps {
  task: any
  onUpdateTask: (updates: any) => void
}

export function CommentManager({
  task,
  onUpdateTask
}: CommentManagerProps) {
  const comments = task?.comments || []
  const currentUser = "Usuário Atual" // This should come from auth context
  const [newComment, setNewComment] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: currentUser,
        createdAt: new Date().toISOString()
      }
      const updatedComments = [...comments, newCommentObj]
      onUpdateTask({ comments: updatedComments })
      setNewComment("")
    }
  }

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditingContent(comment.content)
  }

  const handleSaveEdit = () => {
    if (editingId && editingContent.trim()) {
      const updatedComments = comments.map(comment => 
        comment.id === editingId 
          ? { ...comment, content: editingContent.trim(), edited: true, editedAt: new Date().toISOString() }
          : comment
      )
      onUpdateTask({ comments: updatedComments })
      setEditingId(null)
      setEditingContent("")
    }
  }

  const handleDeleteComment = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      const updatedComments = comments.filter(comment => comment.id !== id)
      onUpdateTask({ comments: updatedComments })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingContent("")
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <h4 className="font-medium">Comentários ({comments.length})</h4>

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.author)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                          {comment.edited && " (editado)"}
                        </span>
                      </div>
                      
                      {comment.author === currentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStartEdit(comment)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive hover:text-destructive/80 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="min-h-[60px] resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddComment()
                }
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Pressione Ctrl+Enter para enviar
              </span>
              <Button 
                size="sm" 
                onClick={handleAddComment} 
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}