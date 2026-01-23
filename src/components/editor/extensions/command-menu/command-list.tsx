'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';
import { Clapperboard, MapPin, Command } from 'lucide-react';

interface CommandListProps {
  items: any[];
  command: (props: any) => void;
}

const icons: Record<string, any> = {
  Clapperboard,
  MapPin,
  Command
};

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded shadow-md overflow-hidden p-1 min-w-[200px]">
      {props.items.map((item, index) => {
        const Icon = icons[item.icon] || Command;
        return (
          <button
            className={cn(
              "w-full text-left p-2 rounded flex items-center gap-2 text-sm",
              index === selectedIndex ? "bg-gray-100 text-blue-600" : "text-gray-700 hover:bg-gray-50"
            )}
            key={index}
            onClick={() => selectItem(index)}
          >
            <Icon className="w-4 h-4" />
            <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
});

CommandList.displayName = 'CommandList';
