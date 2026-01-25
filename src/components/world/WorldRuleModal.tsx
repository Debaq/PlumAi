import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { BookOpen, Trash2, Plus, X, Sparkles, Wand2, Atom, Users, Swords, Coins, Church, Leaf, Cpu, Clock, Ghost, HelpCircle, EyeOff } from 'lucide-react';
import { AITextArea } from '@/components/ui/ai-textarea';
import type { WorldRuleCategory, WorldRuleImportance, WorldRuleExample } from '@/types/domain';

const RULE_CATEGORIES: { id: WorldRuleCategory; label: string; icon: any; color: string }[] = [
  { id: 'magic', label: 'Magia', icon: Wand2, color: 'text-purple-500' },
  { id: 'physics', label: 'Física', icon: Atom, color: 'text-blue-500' },
  { id: 'social', label: 'Social', icon: Users, color: 'text-green-500' },
  { id: 'combat', label: 'Combate', icon: Swords, color: 'text-red-500' },
  { id: 'economy', label: 'Economía', icon: Coins, color: 'text-yellow-500' },
  { id: 'religion', label: 'Religión', icon: Church, color: 'text-amber-500' },
  { id: 'nature', label: 'Naturaleza', icon: Leaf, color: 'text-emerald-500' },
  { id: 'technology', label: 'Tecnología', icon: Cpu, color: 'text-cyan-500' },
  { id: 'temporal', label: 'Temporal', icon: Clock, color: 'text-indigo-500' },
  { id: 'metaphysical', label: 'Metafísica', icon: Ghost, color: 'text-pink-500' },
  { id: 'custom', label: 'Personalizado', icon: HelpCircle, color: 'text-gray-500' },
];

const IMPORTANCE_LEVELS: { id: WorldRuleImportance; label: string; color: string }[] = [
  { id: 'fundamental', label: 'Fundamental', color: 'bg-red-500' },
  { id: 'major', label: 'Mayor', color: 'bg-yellow-500' },
  { id: 'minor', label: 'Menor', color: 'bg-green-500' },
];

export const WorldRuleModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { addWorldRule, updateWorldRule, deleteWorldRule, activeProject } = useProjectStore();

  const isEditing = activeModal === 'editWorldRule' && modalData?.id;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorldRuleCategory>('magic');
  const [customCategory, setCustomCategory] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [importance, setImportance] = useState<WorldRuleImportance>('major');
  const [exceptions, setExceptions] = useState<string[]>([]);
  const [exceptionInput, setExceptionInput] = useState('');
  const [examples, setExamples] = useState<WorldRuleExample[]>([]);
  const [relatedRuleIds, setRelatedRuleIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  useEffect(() => {
    if (activeModal === 'editWorldRule') {
      if (modalData) {
        setTitle(modalData.title || '');
        setCategory(modalData.category || 'magic');
        setCustomCategory(modalData.customCategory || '');
        setContent(modalData.content || '');
        setSummary(modalData.summary || '');
        setImportance(modalData.importance || 'major');
        setExceptions(modalData.exceptions || []);
        setExamples(modalData.examples || []);
        setRelatedRuleIds(modalData.relatedRuleIds || []);
        setImageUrl(modalData.imageUrl || '');
        setIsSecret(modalData.isSecret || false);
      } else {
        resetForm();
      }
    }
  }, [activeModal, modalData]);

  const resetForm = () => {
    setTitle('');
    setCategory('magic');
    setCustomCategory('');
    setContent('');
    setSummary('');
    setImportance('major');
    setExceptions([]);
    setExamples([]);
    setRelatedRuleIds([]);
    setImageUrl('');
    setIsSecret(false);
  };

  const addException = () => {
    if (exceptionInput.trim() && !exceptions.includes(exceptionInput.trim())) {
      setExceptions([...exceptions, exceptionInput.trim()]);
      setExceptionInput('');
    }
  };

  const removeException = (index: number) => {
    setExceptions(exceptions.filter((_, i) => i !== index));
  };

  const addExample = () => {
    setExamples([...examples, { id: crypto.randomUUID(), title: '', description: '' }]);
  };

  const updateExample = (index: number, field: keyof WorldRuleExample, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const toggleRelatedRule = (ruleId: string) => {
    if (relatedRuleIds.includes(ruleId)) {
      setRelatedRuleIds(relatedRuleIds.filter(id => id !== ruleId));
    } else {
      setRelatedRuleIds([...relatedRuleIds, ruleId]);
    }
  };

  if (activeModal !== 'editWorldRule') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data = {
      title: title.trim(),
      category,
      customCategory: category === 'custom' ? customCategory.trim() : undefined,
      content: content.trim(),
      summary: summary.trim(),
      importance,
      exceptions,
      examples: examples.filter(ex => ex.title.trim()),
      relatedRuleIds,
      relatedEntityIds: modalData?.relatedEntityIds || [],
      imageUrl,
      isSecret,
    };

    if (isEditing && modalData?.id) {
      updateWorldRule(modalData.id, data);
    } else {
      addWorldRule(data);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (isEditing && confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      deleteWorldRule(modalData.id);
      closeModal();
    }
  };

  const otherRules = (activeProject?.worldRules || []).filter(r => r.id !== modalData?.id);

  return (
    <Dialog open={activeModal === 'editWorldRule'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Regla del Mundo' : 'Nueva Regla del Mundo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule-title">Título</Label>
              <Input
                id="rule-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre de la regla..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-category">Categoría</Label>
              <Select value={category} onValueChange={(v: string) => setCategory(v as WorldRuleCategory)}>
                <SelectTrigger id="rule-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={cat.color} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {category === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="rule-custom-category">Categoría Personalizada</Label>
              <Input
                id="rule-custom-category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Nombre de la categoría..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule-importance">Importancia</Label>
              <Select value={importance} onValueChange={(v: string) => setImportance(v as WorldRuleImportance)}>
                <SelectTrigger id="rule-importance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPORTANCE_LEVELS.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${level.color}`} />
                        {level.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="rule-secret"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="rule-secret" className="flex items-center gap-2 cursor-pointer">
                <EyeOff size={14} className="text-muted-foreground" />
                Conocimiento Secreto
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule-summary">Resumen Corto</Label>
            <Input
              id="rule-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Una breve descripción de la regla..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule-content">Contenido Detallado</Label>
            <AITextArea
              id="rule-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe la regla en detalle, cómo funciona, sus implicaciones..."
              className="min-h-[180px] font-serif leading-relaxed"
              label="Rule Content"
              context={`Rule: ${title}. Category: ${category}. Importance: ${importance}`}
            />
          </div>

          {/* Exceptions */}
          <div className="space-y-3 border-t pt-4">
            <Label>Excepciones</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {exceptions.map((ex, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1 border-orange-500/30 text-orange-500">
                  {ex}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => removeException(i)}>
                    <X size={10} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Añadir una excepción..."
                value={exceptionInput}
                onChange={(e) => setExceptionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addException())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addException}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Sparkles size={14} />
                Ejemplos de Aplicación
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addExample} className="gap-1">
                <Plus size={14} /> Añadir
              </Button>
            </div>
            {examples.map((example, index) => (
              <div key={example.id} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                <div className="flex gap-2">
                  <Input
                    placeholder="Título del ejemplo"
                    value={example.title}
                    onChange={(e) => updateExample(index, 'title', e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeExample(index)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <AITextArea
                  placeholder="Describe el ejemplo..."
                  value={example.description}
                  onChange={(e) => updateExample(index, 'description', e.target.value)}
                  className="min-h-[60px]"
                  label="Example Description"
                  context={`Rule: ${title}, Example: ${example.title}`}
                />
              </div>
            ))}
          </div>

          {/* Related Rules */}
          {otherRules.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <Label>Reglas Relacionadas</Label>
              <div className="flex flex-wrap gap-2">
                {otherRules.map(rule => {
                  const isSelected = relatedRuleIds.includes(rule.id);
                  const RuleIcon = RULE_CATEGORIES.find(c => c.id === rule.category)?.icon || BookOpen;
                  return (
                    <Badge
                      key={rule.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${isSelected ? '' : 'hover:bg-primary/10'}`}
                      onClick={() => toggleRelatedRule(rule.id)}
                    >
                      <RuleIcon size={12} className="mr-1" />
                      {rule.title}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="p-4 border-t bg-muted/30 flex justify-between items-center sm:justify-between">
          <div>
            {isEditing && (
              <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => closeModal()}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={!title.trim()}>
              {isEditing ? 'Guardar Cambios' : 'Crear Regla'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
