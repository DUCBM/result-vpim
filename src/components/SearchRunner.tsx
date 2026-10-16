import React, { useState, useRef, useEffect } from 'react';
import { Search, X, CheckCircle2, ChevronRight, Loader2, Info } from 'lucide-react';
import { Runner, SupabaseConfig } from '../types';
import { DEMO_RUNNERS, DEMO_PHOTOS, getDemoPhoto } from '../data/mockRunners';
import { searchSingleRunnerFromSupabase } from '../services/supabaseService';
import { useLanguage } from '../i18n/LanguageContext';

interface SearchRunnerProps {
  runners: Runner[];
  selectedRunner: Runner | null;
  onSelectRunner: (runner: Runner) => void;
  isLoading?: boolean;
  demoRunners?: Runner[];
  demoPhotos?: Record<string, string>;
  showDemoChips?: boolean;
  supabaseConfig?: SupabaseConfig;
  raceFilter?: string;
  raceDate?: string;
}

export const SearchRunner: React.FC<SearchRunnerProps> = ({
  runners,
  selectedRunner,
  onSelectRunner,
  isLoading = false,
  demoRunners,
  demoPhotos,
  showDemoChips = true,
  supabaseConfig,
  raceFilter,
  raceDate = '2026',
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [remoteSuggestions, setRemoteSuggestions] = useState<Runner[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeDemos = demoRunners && demoRunners.length > 0 ? demoRunners : DEMO_RUNNERS;
  const activePhotos = demoPhotos || DEMO_PHOTOS;

  // Normalize Vietnamese accents for diacritic-insensitive search
  const removeDiacritics = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Filter suggestions based on query
  const trimmed = query.trim().toLowerCase();
  const normalizedQuery = removeDiacritics(trimmed);

  // If runners loaded, search directly in runners; fallback to active demo runners
  // Lọc nghiêm ngặt theo đúng giải hiện tại, không bao giờ lấy lộn giải khác
  const searchPool = React.useMemo(() => {
    const list = runners.length > 0 ? runners : activeDemos;
    if (!raceFilter) return list;
    const normFilter = raceFilter.trim().toLowerCase();
    return list.filter((r) => {
      if (r.race) {
        return r.race.trim().toLowerCase() === normFilter;
      }
      return true;
    });
  }, [runners, activeDemos, raceFilter]);

  const localSuggestions = trimmed.length === 0
    ? []
    : searchPool.filter((r) => {
        const matchBib = r.bib.toLowerCase().includes(trimmed);
        const matchName = r.name.toLowerCase().includes(trimmed) || removeDiacritics(r.name).includes(normalizedQuery);
        return matchBib || matchName;
      }).slice(0, 8); // Top 8 suggestions

  // Debounced remote search from Supabase (chỉ tra trong giải hiện tại trên bảng result)
  useEffect(() => {
    // Rule 1: Chuỗi tìm kiếm phải từ 4 ký tự trở lên mới bắt đầu chạy (searchTerm.length >= 4)
    if (!trimmed || trimmed.length < 4) {
      setRemoteSuggestions([]);
      return;
    }

    if (!supabaseConfig || !supabaseConfig.url || !supabaseConfig.anonKey || !raceFilter) {
      return;
    }

    // Rule 2: Người dùng dừng gõ đủ 1 giây (1000ms) mới gửi request sang Supabase
    const timer = setTimeout(async () => {
      setIsSearchingRemote(true);
      try {
        const searchConfig: SupabaseConfig = {
          ...supabaseConfig,
          table: 'result', // Tra cứu toàn bộ VĐV của giải từ bảng result
        };
        const results = await searchSingleRunnerFromSupabase(searchConfig, trimmed, raceFilter, raceDate);
        if (results && results.length > 0) {
          const normFilter = raceFilter.trim().toLowerCase();
          const strictlyInRace = results.filter((r) => {
            if (r.race) return r.race.trim().toLowerCase() === normFilter;
            return true;
          });
          setRemoteSuggestions(strictlyInRace);
        } else {
          setRemoteSuggestions([]);
        }
      } catch (err) {
        console.warn('Lỗi tìm VĐV từ Supabase:', err);
      } finally {
        setIsSearchingRemote(false);
      }
    }, 1000); // 1000ms = 1 giây

    return () => clearTimeout(timer);
  }, [trimmed, supabaseConfig, raceFilter, raceDate]);

  // Combine local suggestions and remote results (deduplicate by bib)
  const suggestions = React.useMemo(() => {
    const map = new Map<string, Runner>();
    for (const r of localSuggestions) {
      map.set(r.bib.toLowerCase(), r);
    }
    for (const r of remoteSuggestions) {
      if (!map.has(r.bib.toLowerCase())) {
        map.set(r.bib.toLowerCase(), r);
      }
    }
    return Array.from(map.values()).slice(0, 10);
  }, [localSuggestions, remoteSuggestions]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (runner: Runner) => {
    const demoPhoto = getDemoPhoto(runner.bib) || getDemoPhoto(runner.name) || activePhotos[runner.bib];
    const runnerWithPhoto = demoPhoto
      ? { ...runner, photoUrl: demoPhoto }
      : runner;
    onSelectRunner(runnerWithPhoto);
    setQuery(`${runner.name} - ${runner.bib}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions && suggestions.length > 0) {
        const target = suggestions[highlightedIndex] || suggestions[0];
        if (target) {
          handleSelect(target);
        }
      } else if (trimmed) {
        const matched = searchPool.find(
          (r) => r.bib.trim().toLowerCase() === trimmed || removeDiacritics(r.name).trim() === normalizedQuery
        );
        if (matched) {
          handleSelect(matched);
        }
      }
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    }
  };

  return (
    <div className="w-full relative" ref={containerRef} id="search-runner-container">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          id="search-runner-input"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:bg-white focus:border-[#00A850] focus:ring-2 focus:ring-[#00A850]/20 text-sm font-medium transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
          {(isLoading || isSearchingRemote) && (
            <Loader2 className="w-4 h-4 text-[#00A850] animate-spin" />
          )}
          {query && (
            <button
              type="button"
              id="clear-search-btn"
              onClick={() => {
                setQuery('');
                setRemoteSuggestions([]);
                inputRef.current?.focus();
              }}
              title={t('clearSearch')}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="search-suggestions-dropdown"
          className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100"
        >
          {isSearchingRemote && (
            <div className="px-3.5 py-1.5 bg-emerald-50 text-[11px] text-emerald-700 flex items-center gap-2 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A850]" />
              <span>{t('searchingRemote')}</span>
            </div>
          )}

          <div className="px-3.5 py-2 bg-slate-50/90 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>{t('searchResults')} ({suggestions.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">{t('keyboardHint')}</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {suggestions.map((item, index) => {
              const isSelected = selectedRunner?.bib === item.bib;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={item.bib}
                  id={`suggestion-item-${item.bib}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                    isHighlighted ? 'bg-emerald-50/70 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const itemPhoto = getDemoPhoto(item.bib) || getDemoPhoto(item.name) || item.photoUrl;
                      return itemPhoto ? (
                        <img
                          src={itemPhoto}
                          alt={item.name}
                          className="w-7 h-7 rounded-md object-cover border border-slate-200"
                        />
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[11px] ${
                            item.gender === 'F' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#00A850]'
                          }`}
                        >
                          {item.gender}
                        </div>
                      );
                    })()}
                    <div>
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{item.name}</span>
                        <span className="text-xs font-neue-plak font-bold text-[#009A44] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                          #{item.bib}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#00A850] inline shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#009A44] shrink-0 whitespace-nowrap">{item.distance}</span>
                        <span className="text-slate-300">•</span>
                        <span className="shrink-0 whitespace-nowrap">Chip Time: <strong className="font-neue-plak font-bold text-slate-900">{item.chipTime}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span className="shrink-0 whitespace-nowrap">Hạng: <strong className="font-neue-plak font-bold text-amber-600">#{item.overallRank}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-mono text-slate-400 pl-2">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results or Loading message */}
      {isOpen && trimmed.length > 0 && suggestions.length === 0 && (
        <div
          id="no-search-results"
          className="absolute left-0 right-0 mt-1.5 p-3.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 text-center text-slate-500 text-xs"
        >
          {trimmed.length < 4 ? (
            <div className="py-1.5 flex items-center justify-center gap-2 text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Vui lòng nhập thêm <strong>{4 - trimmed.length}</strong> ký tự để tìm kiếm trong giải đấu</span>
            </div>
          ) : (isLoading || isSearchingRemote) ? (
            <div className="py-2.5 flex items-center justify-center gap-2 text-emerald-700 font-medium">
              <Loader2 className="w-4 h-4 text-[#00A850] animate-spin" />
              <span>Đang tra cứu dữ liệu từ máy chủ giải đấu...</span>
            </div>
          ) : (
            <div className="py-1">
              <p>Không tìm thấy vận động viên nào trong giải đấu khớp với "<span className="text-slate-900 font-semibold">{query}</span>"</p>
              <p className="text-[11px] text-slate-400 mt-1">Vui lòng kiểm tra lại số BIB hoặc họ tên trong giải này.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick sample chips */}
      {showDemoChips && activeDemos.length > 0 && (
        <div className="mt-2.5 flex items-center flex-wrap gap-1.5 text-xs" id="demo-runners-section">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">VĐV mẫu:</span>
          {activeDemos.map((r) => {
            const isCurrent = selectedRunner?.bib === r.bib;
            return (
              <button
                key={r.bib}
                type="button"
                id={`demo-runner-btn-${r.bib}`}
                onClick={() => handleSelect(r)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#009A44] text-white border-[#009A44] shadow-xs font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="whitespace-nowrap">{r.name}</span> <span className="font-mono text-[11px] opacity-80 whitespace-nowrap">({r.bib})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
