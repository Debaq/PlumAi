import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance, Props } from 'tippy.js';
import { CommandList } from './command-list';
import { Editor } from '@tiptap/core';

export default {
  items: ({ query }: { query: string }) => {
    return [
      {
        title: 'Scene',
        description: 'Insert a new scene',
        icon: 'Clapperboard',
        command: ({ editor, range }: { editor: Editor; range: any }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent('<h2>New Scene</h2><p></p>')
            .run();
        },
      },
      {
        title: 'Location',
        description: 'Insert a location',
        icon: 'MapPin',
        command: ({ editor, range }: { editor: Editor; range: any }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent('<h3>Location: </h3>')
            .run();
        },
      },
      // Add more commands here
    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: Instance<Props>[] | null = null;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup?.[0].hide();
          return true;
        }

        return (component?.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup?.[0].destroy();
        component?.destroy();
      },
    };
  },
};
