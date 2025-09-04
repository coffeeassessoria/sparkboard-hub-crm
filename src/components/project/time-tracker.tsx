import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Play, Pause, Square, Plus, Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeEntry {
  id: string;
  taskId?: string;
  taskTitle?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // em segundos
  isRunning: boolean;
  user: string;
  tags: string[];
}

interface TimeTrackerProps {
  projectId: string;
}

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    taskId: 'task-1',
    taskTitle: 'Desenvolvimento da Landing Page',
    description: 'Implementação do header e hero section',
    startTime: new Date(2024, 0, 15, 9, 0),
    endTime: new Date(2024, 0, 15, 11, 30),
    duration: 9000, // 2h 30min
    isRunning: false,
    user: 'João Silva',
    tags: ['desenvolvimento', 'frontend']
  },
  {
    id: '2',
    taskId: 'task-2',
    taskTitle: 'Reunião com Cliente',
    description: 'Alinhamento dos requisitos do projeto',
    startTime: new Date(2024, 0, 15, 14, 0),
    endTime: new Date(2024, 0, 15, 15, 0),
    duration: 3600, // 1h
    isRunning: false,
    user: 'Maria Santos',
    tags: ['reunião', 'cliente']
  },
  {
    id: '3',
    description: 'Desenvolvimento do sistema de autenticação',
    startTime: new Date(),
    duration: 1800, // 30min rodando
    isRunning: true,
    user: 'Pedro Costa',
    tags: ['desenvolvimento', 'backend']
  }
];

const mockTasks = [
  { id: 'task-1', title: 'Desenvolvimento da Landing Page' },
  { id: 'task-2', title: 'Reunião com Cliente' },
  { id: 'task-3', title: 'Sistema de Autenticação' },
  { id: 'task-4', title: 'Testes Unitários' }
];

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function TimeTracker({ projectId }: TimeTrackerProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [currentTimer, setCurrentTimer] = useState<TimeEntry | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    taskId: '',
    description: '',
    startTime: '',
    endTime: '',
    tags: ''
  });
  const [deletingEntries, setDeletingEntries] = useState<Set<string>>(new Set());

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const runningEntry = timeEntries.find(entry => entry.isRunning);
    if (runningEntry) {
      setCurrentTimer(runningEntry);
      const startTime = runningEntry.startTime.getTime();
      
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setTimerSeconds(elapsed);
      }, 1000);
    } else {
      setCurrentTimer(null);
      setTimerSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeEntries]);

  const startTimer = useCallback((description: string, taskId?: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      taskId,
      taskTitle: taskId ? mockTasks.find(t => t.id === taskId)?.title : undefined,
      description,
      startTime: new Date(),
      duration: 0,
      isRunning: true,
      user: 'Usuário Atual',
      tags: []
    };

    setTimeEntries(prev => [...prev, newEntry]);
  }, []);

  const stopTimer = useCallback(() => {
    if (currentTimer) {
      setTimeEntries(prev => prev.map(entry => 
        entry.id === currentTimer.id 
          ? { 
              ...entry, 
              endTime: new Date(), 
              duration: timerSeconds,
              isRunning: false 
            }
          : entry
      ));
    }
  }, [currentTimer, timerSeconds]);

  const pauseTimer = useCallback(() => {
    if (currentTimer) {
      setTimeEntries(prev => prev.map(entry => 
        entry.id === currentTimer.id 
          ? { 
              ...entry, 
              duration: timerSeconds,
              isRunning: false 
            }
          : entry
      ));
    }
  }, [currentTimer, timerSeconds]);

  const resumeTimer = useCallback((entryId: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            startTime: new Date(Date.now() - (entry.duration * 1000)),
            isRunning: true 
          }
        : entry
    ));
  }, []);

  const addManualEntry = useCallback(() => {
    if (!newEntry.description || !newEntry.startTime || !newEntry.endTime) return;

    const start = new Date(newEntry.startTime);
    const end = new Date(newEntry.endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    const entry: TimeEntry = {
      id: Date.now().toString(),
      taskId: newEntry.taskId || undefined,
      taskTitle: newEntry.taskId ? mockTasks.find(t => t.id === newEntry.taskId)?.title : undefined,
      description: newEntry.description,
      startTime: start,
      endTime: end,
      duration,
      isRunning: false,
      user: 'Usuário Atual',
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setTimeEntries(prev => [...prev, entry]);
    setNewEntry({ taskId: '', description: '', startTime: '', endTime: '', tags: '' });
    setIsManualEntryOpen(false);
  }, [newEntry]);

  const deleteEntry = useCallback(async (entryId: string) => {
    setDeletingEntries(prev => new Set(prev).add(entryId));
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
    } finally {
      setDeletingEntries(prev => {
        const newSet = new Set(prev);
        newSet.delete(entryId);
        return newSet;
      });
    }
  }, []);

  const totalHours = useMemo(() => 
    timeEntries
      .filter(entry => !entry.isRunning)
      .reduce((total, entry) => total + entry.duration, 0),
    [timeEntries]
  );

  return (
    <div className="space-y-6">
      {/* Timer Ativo */}
      {currentTimer && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Timer Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-primary">
                  {formatTime(timerSeconds)}
                </div>
                <p className="text-sm text-primary/80 mt-2">{currentTimer.description}</p>
                {currentTimer.taskTitle && (
                  <p className="text-xs text-primary/60">Tarefa: {currentTimer.taskTitle}</p>
                )}
              </div>
              <div className="flex justify-center gap-2">
                <Button onClick={pauseTimer} variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
                <Button onClick={stopTimer} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Parar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Iniciar Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="timer-description">Descrição</Label>
                <Input
                  id="timer-description"
                  placeholder="O que você está fazendo?"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      startTimer(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                  disabled={!!currentTimer}
                />
              </div>
              <div>
                <Label>Tarefa (opcional)</Label>
                <Select disabled={!!currentTimer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                disabled={!!currentTimer}
                onClick={() => {
                  const input = document.getElementById('timer-description') as HTMLInputElement;
                  if (input?.value.trim()) {
                    startTimer(input.value.trim());
                    input.value = '';
                  }
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Timer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatDuration(totalHours)}</div>
                <p className="text-sm text-muted-foreground">Total registrado</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{timeEntries.length}</div>
                <p className="text-sm text-muted-foreground">Entradas de tempo</p>
              </div>
              <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Manualmente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Entrada Manual</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="manual-task">Tarefa (opcional)</Label>
                      <Select value={newEntry.taskId} onValueChange={(value) => setNewEntry(prev => ({ ...prev, taskId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tarefa" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTasks.map(task => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manual-description">Descrição</Label>
                      <Textarea
                        id="manual-description"
                        value={newEntry.description}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o trabalho realizado"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="manual-start">Início</Label>
                        <Input
                          id="manual-start"
                          type="datetime-local"
                          value={newEntry.startTime}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="manual-end">Fim</Label>
                        <Input
                          id="manual-end"
                          type="datetime-local"
                          value={newEntry.endTime}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="manual-tags">Tags (separadas por vírgula)</Label>
                      <Input
                        id="manual-tags"
                        value={newEntry.tags}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="desenvolvimento, frontend, reunião"
                      />
                    </div>
                    <Button onClick={addManualEntry} className="w-full">
                      Adicionar Entrada
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Entradas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {entry.isRunning ? formatTime(timerSeconds) : formatDuration(entry.duration)}
                      </span>
                      {entry.isRunning && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          Rodando
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mb-2">{entry.description}</p>
                    {entry.taskTitle && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Tarefa: {entry.taskTitle}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(entry.startTime, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        {entry.endTime && (
                          <span> - {format(entry.endTime, 'HH:mm', { locale: ptBR })}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.user}
                      </div>
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <div className="flex gap-1">
                          {entry.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!entry.isRunning && entry.endTime && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resumeTimer(entry.id)}
                        disabled={!!currentTimer}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteEntry(entry.id)}
                      disabled={deletingEntries.has(entry.id)}
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}