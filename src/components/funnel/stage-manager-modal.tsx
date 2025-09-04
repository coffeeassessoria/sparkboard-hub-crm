import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  GripVertical, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Palette
} from 'lucide-react';
import { Stage } from '@/pages/FunilVendas';
import { toast } from '@/components/ui/use-toast';

interface StageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: Stage[];
  onUpdateStages: (stages: Stage[]) => void;
}

const colorOptions = [
    { name: 'Coffee Azul', value: 'bg-primary' },
    { name: 'Coffee Laranja', value: 'bg-secondary' },
    { name: 'Sucesso', value: 'bg-success' },
    { name: 'Aviso', value: 'bg-warning' },
    { name: 'Informação', value: 'bg-info' },
    { name: 'Perigo', value: 'bg-destructive' },
    { name: 'Accent', value: 'bg-accent' },
    { name: 'Muted', value: 'bg-muted-foreground' },
    { name: 'Cinza', value: 'bg-gray-500' },
  ];

export const StageManagerModal: React.FC<StageManagerModalProps> = ({
  isOpen,
  onClose,
  stages,
  onUpdateStages
}) => {
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('bg-primary');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalStages([...stages]);
    }
  }, [isOpen, stages]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localStages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedStages = items.map((stage, index) => ({
      ...stage,
      order: index
    }));

    setLocalStages(reorderedStages);
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da etapa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: newStageName.trim(),
      color: newStageColor,
      order: localStages.length
    };

    setLocalStages([...localStages, newStage]);
    setNewStageName('');
    setNewStageColor('bg-primary');
    
    toast({
      title: "Etapa adicionada",
      description: `Etapa "${newStage.name}" foi adicionada com sucesso`,
    });
  };

  const handleEditStage = (stageId: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da etapa não pode ser vazio",
        variant: "destructive"
      });
      return;
    }

    setLocalStages(localStages.map(stage =>
      stage.id === stageId ? { ...stage, name: newName.trim() } : stage
    ));
    setEditingStage(null);
    
    toast({
      title: "Etapa atualizada",
      description: "Nome da etapa foi atualizado com sucesso",
    });
  };

  const handleDeleteStage = (stageId: string) => {
    const stageToDelete = localStages.find(s => s.id === stageId);
    
    if (window.confirm(`Tem certeza que deseja excluir a etapa "${stageToDelete?.name}"?`)) {
      const filteredStages = localStages.filter(stage => stage.id !== stageId);
      // Reorder remaining stages
      const reorderedStages = filteredStages.map((stage, index) => ({
        ...stage,
        order: index
      }));
      
      setLocalStages(reorderedStages);
      
      toast({
        title: "Etapa removida",
        description: "A etapa foi removida com sucesso",
      });
    }
  };

  const handleChangeColor = (stageId: string, color: string) => {
    setLocalStages(localStages.map(stage =>
      stage.id === stageId ? { ...stage, color } : stage
    ));
    setShowColorPicker(null);
    
    toast({
      title: "Cor atualizada",
      description: "Cor da etapa foi atualizada com sucesso",
    });
  };

  const handleSave = () => {
    onUpdateStages(localStages);
    onClose();
    
    toast({
      title: "Alterações salvas",
      description: "As configurações das etapas foram atualizadas",
    });
  };

  const handleCancel = () => {
    setLocalStages([...stages]);
    setEditingStage(null);
    setNewStageName('');
    setNewStageColor('bg-primary');
    setShowColorPicker(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Etapas do Funil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Stage */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adicionar Nova Etapa</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="newStageName">Nome da etapa</Label>
                    <Input
                      id="newStageName"
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="Ex: Qualificação"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddStage()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded cursor-pointer border-2 border-border ${newStageColor}`}
                        onClick={() => setShowColorPicker('new')}
                      />
                      <Button onClick={handleAddStage} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Color Picker for New Stage */}
                {showColorPicker === 'new' && (
                  <div className="grid grid-cols-5 gap-2 p-3 border rounded-md">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded border-2 ${color.value} ${
                          newStageColor === color.value ? 'border-foreground' : 'border-border'
                        }`}
                        onClick={() => {
                          setNewStageColor(color.value);
                          setShowColorPicker(null);
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Stages */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Etapas Existentes</h3>
            <p className="text-sm text-muted-foreground">
              Arraste para reordenar as etapas
            </p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stages">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {localStages.map((stage, index) => (
                    <Draggable key={stage.id} draggableId={stage.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-5 h-5 text-muted-foreground" />
                              </div>

                              <div 
                                className={`w-4 h-4 rounded-full ${stage.color} cursor-pointer`}
                                onClick={() => setShowColorPicker(stage.id)}
                              />

                              <div className="flex-1">
                                {editingStage === stage.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={stage.name}
                                      onChange={(e) => {
                                        const newName = e.target.value;
                                        setLocalStages(localStages.map(s =>
                                          s.id === stage.id ? { ...s, name: newName } : s
                                        ));
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          handleEditStage(stage.id, stage.name);
                                        }
                                      }}
                                      className="flex-1"
                                      autoFocus
                                    />
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleEditStage(stage.id, stage.name)}
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setEditingStage(null)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{stage.name}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">Posição {index + 1}</Badge>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingStage(stage.id)}
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteStage(stage.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Color Picker for Existing Stage */}
                            {showColorPicker === stage.id && (
                              <div className="grid grid-cols-5 gap-2 p-3 border rounded-md mt-3">
                                {colorOptions.map((color) => (
                                  <button
                                    key={color.value}
                                    className={`w-8 h-8 rounded border-2 ${color.value} ${
                                      stage.color === color.value ? 'border-foreground' : 'border-border'
                                    }`}
                                    onClick={() => handleChangeColor(stage.id, color.value)}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
