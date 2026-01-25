import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dices, Trash2 } from 'lucide-react';

interface RollResult {
  id: string;
  dice: string;
  result: number;
  timestamp: string;
}

export const DiceRoller = () => {
  const [history, setHistory] = useState<RollResult[]>([]);

  const rollDice = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    const newRoll: RollResult = {
      id: crypto.randomUUID(),
      dice: `d${sides}`,
      result,
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => [newRoll, ...prev]);
  };

  const clearHistory = () => setHistory([]);

  const DiceButton = ({ sides }: { sides: number }) => (
    <Button
      variant="outline"
      size="sm"
      className="h-12 w-12 flex flex-col items-center justify-center gap-0.5"
      onClick={() => rollDice(sides)}
    >
      <span className="text-xs font-bold">d{sides}</span>
    </Button>
  );

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5" />
          <h3 className="font-semibold">Dice Roller</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={clearHistory} title="Clear History">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 grid grid-cols-4 gap-2">
        <DiceButton sides={4} />
        <DiceButton sides={6} />
        <DiceButton sides={8} />
        <DiceButton sides={10} />
        <DiceButton sides={12} />
        <DiceButton sides={20} />
        <DiceButton sides={100} />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          History
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Roll the dice to see results here.
            </div>
          ) : (
            history.map((roll) => (
              <div key={roll.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-3">
                   <span className="text-sm font-medium text-muted-foreground uppercase">{roll.dice}</span>
                   <span className="text-lg font-bold text-primary">{roll.result}</span>
                </div>
                <span className="text-xs text-muted-foreground">{roll.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
