import React, { useState, useRef } from "react"
import { Upload, Download, Trash2, File, Image, FileText, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

interface AttachmentManagerProps {
  attachments: Attachment[]
  onAddAttachment: (file: File) => Promise<void>
  onDeleteAttachment: (id: string) => void
  maxFileSize?: number // em MB
  allowedTypes?: string[]
}

export function AttachmentManager({
  attachments,
  onAddAttachment,
  onDeleteAttachment,
  maxFileSize = 10, // 10MB por padrão
  allowedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar']
}: AttachmentManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    if (type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
      return <FileText className="h-4 w-4 text-destructive" />
    }
    if (type.includes('zip') || type.includes('rar') || name.toLowerCase().match(/\.(zip|rar|7z)$/)) {
      return <Archive className="h-4 w-4 text-warning" />
    }
    return <File className="h-4 w-4" />
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamanho do arquivo
    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxFileSize}MB`)
      return
    }

    // Validar tipo do arquivo
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })

    if (!isValidType) {
      alert('Tipo de arquivo não permitido')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      await onAddAttachment(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload do arquivo')
      setUploading(false)
      setUploadProgress(0)
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = (attachment: Attachment) => {
    // Em um ambiente real, isso faria o download do arquivo
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Anexos ({attachments.length})</h4>
            <Button 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Enviando...' : 'Anexar'}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept={allowedTypes.join(',')}
          />

          {/* Attachments List */}
          <div className="space-y-2">
            {attachments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum anexo ainda. Clique em "Anexar" para adicionar arquivos.
              </p>
            ) : (
              attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment.type, attachment.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{attachment.name}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(attachment)}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteAttachment(attachment.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>•</span>
                      <span>por {attachment.uploadedBy}</span>
                      <span>•</span>
                      <span>{formatDate(attachment.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* File Type Info */}
          <div className="text-xs text-muted-foreground">
            <p>Tipos permitidos: Imagens, PDF, documentos, planilhas, arquivos compactados</p>
            <p>Tamanho máximo: {maxFileSize}MB por arquivo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}