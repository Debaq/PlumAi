'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface MentionListProps {
  items: any[];
  command: (props: any) => void;
}

export const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
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
      {props.items.map((item, index) => (
        <button
          className={cn(
            "w-full text-left p-2 rounded flex items-center gap-2 text-sm",
            index === selectedIndex ? "bg-gray-100 text-blue-600" : "text-gray-700 hover:bg-gray-50"
          )}
          key={index}
          onClick={() => selectItem(index)}
        >
          {item.icon || <User className="w-4 h-4" />}
          <span>{item.label || item.name}</span>
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';
