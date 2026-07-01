import { type ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import './tabs.css'

type Tab = {
  key: string;
  label: ComponentChildren;
  content: ComponentChildren;
};

type TabsProps = {
  tabs: Tab[];
  initialTab?: string;
};

export default function Tabs({ tabs, initialTab }: TabsProps) {
  const [active, setActive] = useState(initialTab ?? tabs[0]?.key);

  return (
    <div class="tabs">
      <div class="tabs-bar">
        {tabs.map((tab) => {
          const isActive = active === tab.key;

          return (
            <button
              key={tab.key}
              class={`tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActive(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div class="tab-content">
        {tabs.find((t) => t.key === active)?.content}
      </div>
    </div>
  );
}