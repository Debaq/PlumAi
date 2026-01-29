import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookMarked, Scissors } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

export const PublishingTabBar: React.FC = () => {
  const { t } = useTranslation();
  const { activePublishingTab, setActivePublishingTab } = useUIStore();

  const tabs = [
    { key: 'book' as const, icon: BookMarked, label: t('publishing.tabs.book', 'Book') },
    { key: 'zines' as const, icon: Scissors, label: t('publishing.tabs.zines', "Zine's") },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 mb-6">
      {tabs.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
            activePublishingTab === key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          onClick={() => setActivePublishingTab(key)}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};
