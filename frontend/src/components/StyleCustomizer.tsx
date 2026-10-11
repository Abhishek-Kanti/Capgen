import React, { useState } from 'react';
import { StylePreset } from '../types/caption';
import { CAPTION_PRESETS } from '../utils/presets';
import { 
  Palette, Type, Sliders, Check, 
  AlignLeft, AlignCenter, AlignRight, 
  MoveHorizontal, Square, ChevronDown, ChevronRight,
  Sparkles
} from 'lucide-react';

interface StyleCustomizerProps {
  style: StylePreset;
  onStyleChange: (newStyle: StylePreset) => void;
  yPercent: number;
  onYPercentChange: (y: number) => void;
}

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({
  style,
  onStyleChange,
  yPercent,
  onYPercentChange,
}) => {
  // Collapsible section state to reduce cognitive load
  const [openSections, setOpenSections] = useState({
    presets: true,
    typography: false,
    spacing: false,
    box: false,
    colors: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePresetSelect = (preset: StylePreset) => {
    onStyleChange({
      ...preset,
    });
  };

  const updateProp = <K extends keyof StylePreset>(key: K, value: StylePreset[K]) => {
    onStyleChange({
      ...style,
      [key]: value,
    });
  };

  return (
    <aside className="w-84 h-full flex flex-col bg-[#0b0c16] border-l border-white/8 select-none shrink-0 overflow-y-auto custom-scrollbar z-10">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
            <Palette className="w-3 h-3" />
          </div>
          <h2 className="text-xs font-bold text-white tracking-wider uppercase">
            Style Studio
          </h2>
        </div>

        {/* Quick Preset Dropdown with Explicit Dark Styling */}
        <select
          value={style.id}
          onChange={(e) => {
            const chosen = CAPTION_PRESETS.find(p => p.id === e.target.value);
            if (chosen) handlePresetSelect(chosen);
          }}
          style={{
            backgroundColor: '#181a2e',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '4px 8px',
            outline: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            maxWidth: '140px'
          }}
        >
          {CAPTION_PRESETS.map(p => (
            <option key={p.id} value={p.id} style={{ backgroundColor: '#181a2e', color: '#fff' }}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Accordion 1: Presets Gallery */}
        <div className="studio-accordion-box">
          <button
            type="button"
            onClick={() => toggleSection('presets')}
            className="studio-accordion-header"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-white">Presets</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/15 px-1.5 py-0.2 rounded">
                {style.name}
              </span>
              {openSections.presets ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {openSections.presets && (
            <div className="p-3 pt-0 grid grid-cols-1 gap-1.5 border-t border-white/5 mt-1 pt-2.5 animate-fade-in">
              {CAPTION_PRESETS.map((p) => {
                const isSelected = style.id === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handlePresetSelect(p)}
                    style={{
                      backgroundColor: isSelected ? 'rgba(30, 27, 75, 0.5)' : '#161726',
                      borderColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.07)',
                      color: '#ffffff'
                    }}
                    className="p-2 rounded-xl border text-left transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="px-2 py-0.5 rounded text-[10px] font-black transition"
                        style={{
                          backgroundColor: p.hasBg ? p.bgColor : '#1c1d2e',
                          color: p.textColor,
                          fontFamily: p.fontFamily,
                          fontWeight: p.fontWeight || 900,
                          WebkitTextStroke: p.strokeWidth > 0 ? `1px ${p.strokeColor}` : undefined,
                        }}
                      >
                        <span>JUST</span>
                        <span style={{ color: p.highlightColor }}>THIS</span>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-white flex items-center gap-1">
                          {p.name}
                        </div>
                        <div className="text-[9px] text-zinc-500">{p.fontFamily}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accordion 2: Typography & Boldness */}
        <div className="studio-accordion-box">
          <button
            type="button"
            onClick={() => toggleSection('typography')}
            className="studio-accordion-header"
          >
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-white">Typography</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className="text-[10px] font-mono text-zinc-400">
                {style.fontSize}px · {style.fontWeight || 900}
              </span>
              {openSections.typography ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {openSections.typography && (
            <div className="p-3 pt-2 space-y-3 border-t border-white/5 animate-fade-in">
              {/* Font Family Dropdown */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Font Family</label>
                <select
                  value={style.fontFamily}
                  onChange={(e) => updateProp('fontFamily', e.target.value)}
                  style={{
                    backgroundColor: '#181a2e',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Montserrat" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Montserrat (Creator Bold)</option>
                  <option value="Anton" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Anton (Heavy Impact)</option>
                  <option value="Inter" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Inter (Minimal Clean)</option>
                  <option value="Poppins" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Poppins (Geometric)</option>
                </select>
              </div>

              {/* Boldness Toggle Buttons */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Font Weight</span>
                  <span className="font-mono text-white text-[10px]">{style.fontWeight || 900}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'Semi', weight: 600 },
                    { label: 'Bold', weight: 700 },
                    { label: 'Extra', weight: 800 },
                    { label: 'Black', weight: 900 },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.weight}
                      onClick={() => updateProp('fontWeight', opt.weight)}
                      style={{
                        backgroundColor: (style.fontWeight || 900) === opt.weight ? '#4f46e5' : '#181a2e',
                        color: (style.fontWeight || 900) === opt.weight ? '#ffffff' : '#94a3b8',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                      className="py-1 rounded-lg text-[10px] font-bold transition"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment Buttons */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Text Alignment</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => updateProp('textAlign', 'left')}
                    style={{
                      backgroundColor: style.textAlign === 'left' ? '#4f46e5' : '#181a2e',
                      color: style.textAlign === 'left' ? '#ffffff' : '#94a3b8',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    className="py-1.5 rounded-lg flex items-center justify-center transition"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProp('textAlign', 'center')}
                    style={{
                      backgroundColor: style.textAlign === 'center' ? '#4f46e5' : '#181a2e',
                      color: style.textAlign === 'center' ? '#ffffff' : '#94a3b8',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    className="py-1.5 rounded-lg flex items-center justify-center transition"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProp('textAlign', 'right')}
                    style={{
                      backgroundColor: style.textAlign === 'right' ? '#4f46e5' : '#181a2e',
                      color: style.textAlign === 'right' ? '#ffffff' : '#94a3b8',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    className="py-1.5 rounded-lg flex items-center justify-center transition"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono text-white text-[11px]">{style.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="38"
                  step="1"
                  value={style.fontSize}
                  onChange={(e) => updateProp('fontSize', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Spacing & Layout */}
        <div className="studio-accordion-box">
          <button
            type="button"
            onClick={() => toggleSection('spacing')}
            className="studio-accordion-header"
          >
            <div className="flex items-center gap-2">
              <MoveHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-white">Spacing & Position</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className="text-[10px] font-mono text-zinc-400">
                Word: {style.wordSpacing ?? 4}px · Y: {Math.round(yPercent)}%
              </span>
              {openSections.spacing ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {openSections.spacing && (
            <div className="p-3 pt-2 space-y-3 border-t border-white/5 animate-fade-in">
              {/* Word Gap Spacing */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Word Gap Spacing</span>
                  <span className="font-mono text-white text-[11px]">{style.wordSpacing ?? 4}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="1"
                  value={style.wordSpacing ?? 4}
                  onChange={(e) => updateProp('wordSpacing', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Letter Spacing */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Letter Tracking</span>
                  <span className="font-mono text-white text-[11px]">{style.letterSpacing ?? -0.5}px</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="5"
                  step="0.5"
                  value={style.letterSpacing ?? -0.5}
                  onChange={(e) => updateProp('letterSpacing', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Vertical Position */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Vertical Position (Y)</span>
                  <span className="font-mono text-white text-[11px]">{Math.round(yPercent)}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={yPercent}
                  onChange={(e) => onYPercentChange(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion 4: Pill Background Box */}
        <div className="studio-accordion-box">
          <button
            type="button"
            onClick={() => toggleSection('box')}
            className="studio-accordion-header"
          >
            <div className="flex items-center gap-2">
              <Square className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-white">Pill Container</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${style.hasBg ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-zinc-500'}`}>
                {style.hasBg ? 'Active' : 'Off'}
              </span>
              {openSections.box ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {openSections.box && (
            <div className="p-3 pt-2 space-y-3 border-t border-white/5 animate-fade-in">
              {/* Enable Pill Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-zinc-300 font-semibold">Enable Background Box</label>
                <input
                  type="checkbox"
                  checked={style.hasBg}
                  onChange={(e) => updateProp('hasBg', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              {style.hasBg && (
                <div className="space-y-3 pt-1 border-t border-white/5">
                  {/* Box Color */}
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-zinc-400">Pill Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={style.bgColor.startsWith('#') ? style.bgColor : '#ffffff'}
                        onChange={(e) => updateProp('bgColor', e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[10px] text-zinc-300 uppercase">
                        {style.bgColor}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Padding X */}
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Horizontal Padding</span>
                      <span className="font-mono text-white text-[11px]">{style.boxPaddingX ?? 12}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="24"
                      step="1"
                      value={style.boxPaddingX ?? 12}
                      onChange={(e) => updateProp('boxPaddingX', Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Vertical Padding Y */}
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Vertical Padding</span>
                      <span className="font-mono text-white text-[11px]">{style.boxPaddingY ?? 4}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      step="1"
                      value={style.boxPaddingY ?? 4}
                      onChange={(e) => updateProp('boxPaddingY', Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Corner Radius</span>
                      <span className="font-mono text-white text-[11px]">{style.boxRadius ?? 6}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={style.boxRadius ?? 6}
                      onChange={(e) => updateProp('boxRadius', Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 5: Colors & Outlines */}
        <div className="studio-accordion-box">
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className="studio-accordion-header"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-white">Colors & Effects</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: style.highlightColor }} />
              {openSections.colors ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {openSections.colors && (
            <div className="p-3 pt-2 space-y-3 border-t border-white/5 animate-fade-in">
              {/* Active Spoken Word Color */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-zinc-400">Active Spoken Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={style.highlightColor}
                    onChange={(e) => updateProp('highlightColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[10px] text-zinc-300 uppercase">
                    {style.highlightColor}
                  </span>
                </div>
              </div>

              {/* Inactive Base Text Color */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-zinc-400">Base Text Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={style.textColor.startsWith('#') ? style.textColor : '#ffffff'}
                    onChange={(e) => updateProp('textColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[10px] text-zinc-300 uppercase">
                    {style.textColor}
                  </span>
                </div>
              </div>

              {/* Stroke Outline */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Black Stroke Outline</span>
                  <span className="font-mono text-white text-[11px]">{style.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={style.strokeWidth}
                  onChange={(e) => updateProp('strokeWidth', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Force Uppercase */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-[11px] text-zinc-400">Force Uppercase</label>
                <input
                  type="checkbox"
                  checked={style.uppercase}
                  onChange={(e) => updateProp('uppercase', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
