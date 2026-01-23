import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance, Props } from 'tippy.js';
import { MentionList } from './mention-list';
import { useProjectStore } from '@/stores/useProjectStore';

export default {
  items: ({ query }: { query: string }) => {
    const project = useProjectStore.getState().activeProject;
    const characters = project?.characters || [];

    // Transform characters to mention items
    const items = characters.map(char => ({
      id: char.id,
      label: char.name,
      name: char.name,
      // You can add more props here
    }));

    // Filter by query
    return items
      .filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: Instance<Props>[] | null = null;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
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

        return component?.ref?.onKeyDown(props);
      },

      onExit() {
        popup?.[0].destroy();
        component?.destroy();
      },
    };
  },
};
