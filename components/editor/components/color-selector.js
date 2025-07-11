import { Check, ChevronDown } from 'lucide-react';

const TEXT_COLORS = [
  {
    name: 'Default',
    color: 'var(--novel-black)',
  },
  {
    name: 'Purple',
    color: '#9333EA',
  },
  {
    name: 'Red',
    color: '#E00000',
  },
  {
    name: 'Yellow',
    color: '#EAB308',
  },
  {
    name: 'Blue',
    color: '#2563EB',
  },
  {
    name: 'Green',
    color: '#008A00',
  },
  {
    name: 'Orange',
    color: '#FFA500',
  },
  {
    name: 'Pink',
    color: '#BA4081',
  },
  {
    name: 'Gray',
    color: '#A8A29E',
  },
];

const HIGHLIGHT_COLORS = [
  {
    name: 'Default',
    color: 'var(--novel-highlight-default)',
  },
  {
    name: 'Purple',
    color: 'var(--novel-highlight-purple)',
  },
  {
    name: 'Red',
    color: 'var(--novel-highlight-red)',
  },
  {
    name: 'Yellow',
    color: 'var(--novel-highlight-yellow)',
  },
  {
    name: 'Blue',
    color: 'var(--novel-highlight-blue)',
  },
  {
    name: 'Green',
    color: 'var(--novel-highlight-green)',
  },
  {
    name: 'Orange',
    color: 'var(--novel-highlight-orange)',
  },
  {
    name: 'Pink',
    color: 'var(--novel-highlight-pink)',
  },
  {
    name: 'Gray',
    color: 'var(--novel-highlight-gray)',
  },
];

export const ColorSelector = ({ editor, isOpen, setIsOpen }) => {
  const activeColorItem = TEXT_COLORS.find(({ color }) => editor.isActive('textStyle', { color }));

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive('highlight', { color }),
  );

  return (
    <div className="relative h-full">
      <button
        className="hover:bg-stone-100 active:bg-stone-200 flex h-full items-center gap-1 p-2 text-sm font-medium text-gray-600"
        onClick={() => setIsOpen(!isOpen)}
        type="button">
        <span
          className="rounded-sm px-1"
          style={{
            color: activeColorItem?.color,
            backgroundColor: activeHighlightItem?.color,
          }}>
          A
        </span>

        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <section className="border-stone-200 fixed top-full z-[99999] mt-1 flex w-48 flex-col overflow-hidden rounded border bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-1">
          <div className="my-1 px-2 text-sm text-gray-500">Color</div>
          {TEXT_COLORS.map(({ name, color }, index) => (
            <button
              key={index}
              onClick={() => {
                editor.commands.unsetColor();
                if (name !== 'Default') {
                  editor.chain().focus().setColor(color).run();
                }
                setIsOpen(false);
              }}
              className="hover:bg-stone-100 flex items-center justify-between rounded-sm px-2 py-1 text-sm text-gray-600"
              type="button">
              <div className="flex items-center space-x-2">
                <div
                  className="border-stone-200 rounded-sm border px-1 py-px font-medium"
                  style={{ color }}>
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive('textStyle', { color }) && <Check className="h-4 w-4" />}
            </button>
          ))}

          <div className="mb-1 mt-2 px-2 text-sm text-gray-500">Background</div>

          {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
            <button
              key={index}
              onClick={() => {
                editor.commands.unsetHighlight();
                if (name !== 'Default') {
                  editor.commands.setHighlight({ color });
                }
                setIsOpen(false);
              }}
              className="hover:bg-stone-100 flex items-center justify-between rounded-sm px-2 py-1 text-sm text-gray-600"
              type="button">
              <div className="flex items-center space-x-2">
                <div
                  className="border-stone-200 rounded-sm border px-1 py-px font-medium"
                  style={{ backgroundColor: color }}>
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive('highlight', { color }) && <Check className="h-4 w-4" />}
            </button>
          ))}
        </section>
      )}
    </div>
  );
};
