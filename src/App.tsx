import React, { useState, useEffect, useCallback } from 'react';
import { Race, DEFAULT_RACE } from './data/races';
import { Runner, DataSourceSettings } from './types';
import { INITIAL_RUNNERS } from './data/mockRunners';
import {
  fetchAllRaces,
  getLocalRaces,
  resolveRaceFromPath,
  parseSubRouteFromPath,
} from './data/raceStorage';
import {
  getSavedDataSourceSettings,
  fetchRunnersFromSource,
  getCachedRunners,
} from './services/sheetService';
import {
  getGlobalSupabaseConfig,
} from './services/supabaseService';
import { RaceSelectorHome } from './components/RaceSelectorHome';
import { RaceRankingTop50 } from './components/RaceRankingTop50';
import { AdminPlacementStudio } from './components/AdminPlacementStudio';
import { LanguageProvider } from './i18n/LanguageContext';

type AppRoute = 'home' | 'admin' | 'ranking';

export default function App() {
  // All races loaded from server / public files / cache
  const [allRaces, setAllRaces] = useState<Race[]>(() => getLocalRaces());
  const [isRacesLoaded, setIsRacesLoaded] = useState<boolean>(false);

  // Active race (defaults to VPBank Hanoi International Marathon 2026)
  const [activeRace, setActiveRace] = useState<Race>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (!pathname || pathname === 'home') {
        const local = getLocalRaces();
        const vp = local.find(r => r.slug.includes('vpbank') || r.id.includes('vpbank'));
        if (vp) return vp;
      }
      return resolveRaceFromPath(
        window.location.pathname + window.location.search + window.location.hash,
        getLocalRaces()
      );
    }
    return DEFAULT_RACE;
  });

  // Current route (defaults directly to 'ranking' without going through root '/')
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (pathname.startsWith('/admin') || search.includes('admin=true')) {
        return 'admin';
      }
      const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
      if (!cleanPath) {
        return 'ranking';
      }
      return parseSubRouteFromPath(pathname);
    }
    return 'ranking';
  });

  // Detect if running inside iframe or with embed flags
  const isEmbedded = typeof window !== 'undefined' && (() => {
    try {
      const search = new URLSearchParams(window.location.search);
      if (search.get('embed') === 'true' || search.get('iframe') === 'true' || search.get('hideHeader') === 'true') {
        return true;
      }
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  // Runners data
  const [runners, setRunners] = useState<Runner[]>(() => {
    const cached = getCachedRunners(activeRace.storageKeyPrefix);
    if (cached && cached.length > 0) return cached;
    return activeRace.initialRunners && activeRace.initialRunners.length > 0
      ? activeRace.initialRunners
      : INITIAL_RUNNERS;
  });
  const [isLoadingRunners, setIsLoadingRunners] = useState<boolean>(false);

  // Settings
  const [dataSourceSettings, setDataSourceSettings] = useState<DataSourceSettings>(() =>
    getSavedDataSourceSettings(activeRace.storageKeyPrefix)
  );

  // Refresh races list
  const refreshRacesList = useCallback(async () => {
    const list = await fetchAllRaces();
    setAllRaces(list);
    setIsRacesLoaded(true);

    if (typeof window !== 'undefined') {
      const fromPath = resolveRaceFromPath(window.location.pathname, list);
      setActiveRace(fromPath);
    }
  }, []);

  useEffect(() => {
    refreshRacesList();
  }, [refreshRacesList]);

  // Load runners for active race
  const loadRunners = useCallback(
    async (targetRace: Race, forceRefresh: boolean = false) => {
      setIsLoadingRunners(true);
      try {
        const settings = getSavedDataSourceSettings(targetRace.storageKeyPrefix);
        setDataSourceSettings(settings);

        const globalSb = getGlobalSupabaseConfig();
        const hasRaceSb = Boolean(targetRace.supabaseUrl && targetRace.supabaseAnonKey);
        const hasGlobalSb = Boolean(globalSb.url && globalSb.anonKey);

        let raceSettings: DataSourceSettings;
        if (hasRaceSb || hasGlobalSb || settings.type === 'supabase' || settings.supabase?.url) {
          const rankingTable = targetRace.supabaseRankingTable || 'top50_result';
          raceSettings = {
            ...settings,
            type: 'supabase',
            url: '',
            supabase: {
              url: targetRace.supabaseUrl || settings.supabase?.url || globalSb.url || '',
              anonKey: targetRace.supabaseAnonKey || settings.supabase?.anonKey || globalSb.anonKey || '',
              table: rankingTable,
              rankingTable: rankingTable,
              raceColumn: targetRace.supabaseRaceColumn || settings.supabase?.raceColumn || globalSb.raceColumn || 'Race',
              raceValue: targetRace.supabaseRaceFilter || settings.supabase?.raceValue || globalSb.raceValue || targetRace.code || targetRace.slug || '',
            },
          };
        } else {
          raceSettings = {
            ...settings,
            url: targetRace.appsScriptUrl || settings.url || '/api/marathon-data',
            type: 'appsScript',
          };
        }

        const res = await fetchRunnersFromSource(
          raceSettings,
          targetRace.storageKeyPrefix,
          targetRace.initialRunners,
          forceRefresh
        );

        if (res.runners && res.runners.length > 0) {
          setRunners(res.runners);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách VĐV:', err);
      } finally {
        setIsLoadingRunners(false);
      }
    },
    []
  );

  // Sync runners when activeRace changes
  useEffect(() => {
    const cached = getCachedRunners(activeRace.storageKeyPrefix);
    if (cached && cached.length > 0) {
      setRunners(cached);
    }
    loadRunners(activeRace);
  }, [activeRace, loadRunners]);

  // Handle Browser Back/Forward Navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const search = window.location.search;

      if (pathname.startsWith('/admin') || search.includes('admin=true')) {
        setCurrentRoute('admin');
        return;
      }

      if (pathname.includes('/result') || pathname.endsWith('result')) {
        const detected = resolveRaceFromPath(pathname + search, allRaces);
        setActiveRace(detected);
        setCurrentRoute('ranking');
        window.history.replaceState(null, '', `/${detected.slug}/ranking`);
        return;
      }

      const subRoute = parseSubRouteFromPath(pathname);
      setCurrentRoute(subRoute);

      const detected = resolveRaceFromPath(pathname + search, allRaces);
      setActiveRace(detected);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allRaces]);

  // URL normalization on mount: directly enter /vpbank-hanoi-international-marathon-2026/ranking if at root '/'
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const search = window.location.search;

    if (!pathname || pathname === 'home') {
      const vpRace = allRaces.find(r => r.slug.includes('vpbank') || r.id.includes('vpbank')) || DEFAULT_RACE;
      setActiveRace(vpRace);
      setCurrentRoute('ranking');
      window.history.replaceState(null, '', `/${vpRace.slug}/ranking${search}`);
      document.title = `Bảng Xếp Hạng Top 50 - ${vpRace.name}`;
      return;
    }

    if (pathname && !pathname.includes('/') && pathname !== 'admin') {
      const matched = resolveRaceFromPath(pathname, allRaces);
      if (matched) {
        window.history.replaceState(null, '', `/${matched.slug}/ranking${search}`);
        setActiveRace(matched);
        setCurrentRoute('ranking');
        document.title = `Bảng Xếp Hạng Top 50 - ${matched.name}`;
      }
    } else if (pathname.includes('/result') || pathname.endsWith('result')) {
      const matched = resolveRaceFromPath(pathname, allRaces);
      window.history.replaceState(null, '', `/${matched.slug}/ranking${search}`);
      setActiveRace(matched);
      setCurrentRoute('ranking');
      document.title = `Bảng Xếp Hạng Top 50 - ${matched.name}`;
    }
  }, [allRaces]);

  // Navigate to Ranking of a race
  const handleNavigateToRanking = (race: Race = activeRace) => {
    setActiveRace(race);
    setCurrentRoute('ranking');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${race.slug}/ranking${window.location.search}`);
      document.title = `Bảng Xếp Hạng Top 50 - ${race.name}`;
    }
  };

  // Navigate to Home Race Selector
  const handleNavigateToHome = () => {
    setCurrentRoute('home');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      document.title = 'Bảng Xếp Hạng Marathon - Chọn Giải Chạy';
    }
  };

  // Navigate to Admin
  const handleNavigateToAdmin = () => {
    setCurrentRoute('admin');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
    }
  };

  return (
    <LanguageProvider>
      {currentRoute === 'admin' ? (
        <AdminPlacementStudio
          runners={runners}
          activeRace={activeRace}
          allRaces={allRaces}
          dataSourceSettings={dataSourceSettings}
          onSelectRace={(race) => {
            setActiveRace(race);
          }}
          onRefreshRaces={refreshRacesList}
          onBackToUserView={() => handleNavigateToRanking(activeRace)}
          onNavigateToRace={(slug) => {
            const found = allRaces.find((r) => r.slug === slug || r.id === slug);
            if (found) {
              handleNavigateToRanking(found);
            }
          }}
          onRunnersUpdated={(newRunners) => setRunners(newRunners)}
          onConfigUpdated={() => {}}
          onLogoUpdated={() => {}}
        />
      ) : currentRoute === 'home' ? (
        <RaceSelectorHome
          races={allRaces}
          onSelectRace={(race) => handleNavigateToRanking(race)}
          onGoToAdmin={handleNavigateToAdmin}
        />
      ) : (
        <RaceRankingTop50
          activeRace={activeRace}
          allRaces={allRaces}
          runners={runners}
          isLoadingRunners={isLoadingRunners}
          onBackToHome={handleNavigateToHome}
          onSelectRace={(race) => handleNavigateToRanking(race)}
          onRefreshData={() => loadRunners(activeRace, true)}
          isEmbedded={isEmbedded}
        />
      )}
    </LanguageProvider>
  );
}
