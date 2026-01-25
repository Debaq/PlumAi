import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';

interface Props {
  attributes: Record<string, any>;
  onChange: (attributes: Record<string, any>) => void;
}

export const CharacterAttributeEditor = ({ attributes, onChange }: Props) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addAttribute = () => {
    if (!newKey.trim()) return;
    onChange({ ...attributes, [newKey]: newValue });
    setNewKey('');
    setNewValue('');
  };

  const removeAttribute = (key: string) => {
    const newAttrs = { ...attributes };
    delete newAttrs[key];
    onChange(newAttrs);
  };

  const updateAttributeValue = (key: string, val: string) => {
      const newAttrs = { ...attributes, [key]: val };
      onChange(newAttrs);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Worldbuilder Stats</h3>
      </div>

      <div className="space-y-2">
        {Object.entries(attributes || {}).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs font-mono bg-muted px-2 py-1 rounded min-w-[80px] text-right truncate" title={key}>
              {key}
            </span>
            <Input
              value={value}
              onChange={(e) => updateAttributeValue(key, e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => removeAttribute(key)}
            >
              <Trash className="w-3 h-3" />
            </Button>
          </div>
        ))}
        {Object.keys(attributes || {}).length === 0 && (
          <div className="text-xs text-muted-foreground italic text-center py-2">
            No attributes defined.
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Input
          placeholder="New Stat (e.g. STR)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="h-8 text-xs w-[120px]"
        />
        <Input
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="h-8 text-xs flex-1"
        />
        <Button
          size="sm"
          variant="secondary"
          className="h-8 px-2"
          onClick={addAttribute}
          disabled={!newKey.trim()}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};
