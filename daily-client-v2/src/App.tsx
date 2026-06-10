import { useState, useEffect } from 'react';
import type { DailyFeed } from './types';

import { ScrollProgressBar } from './components/ScrollProgressBar';
import { Masthead } from './components/Masthead';
import { EditorialArticle } from './components/EditorialArticle';
import { ArticlesList } from './components/ArticlesList';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const savedTheme = localStorage.getItem('daily-flash-theme') as 'light' | 'dark' | null;
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return systemPrefersDark ? 'dark' : 'light';
};

function App() {
  const [feed, setFeed] = useState<DailyFeed | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // UI state
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Sync theme with document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('daily-flash-theme', nextTheme);
  };

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch feed
  const fetchFeed = async () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch('/api/feed');
      if (!response.ok) {
        throw new Error(`Failed to load. Status: ${response.status}`);
      }
      const data: DailyFeed = await response.json();
      setFeed(data);
    } catch (err: unknown) {
      console.error(err);
      setIsError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Could not load the daily feed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchFeed, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ScrollProgressBar progress={scrollProgress} />

      <div className="app-container">

        <Masthead feed={feed} />

        {/* Loading State */}
        {isLoading && (
          <div className="state-container">
            <div className="spinner" />
            <h2 className="state-title">Fetching Feed</h2>
            <p className="state-desc">Loading daily articles...</p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="state-container">
            <h2 className="state-title" style={{ color: 'var(--color-crit)' }}>Failed to Load</h2>
            <p className="state-desc">{errorMessage}</p>
            <button className="btn-retry" onClick={fetchFeed}>Retry</button>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !isError && feed && (
          <main>
            <EditorialArticle summary={feed.data.top_summary} />

            <ArticlesList stories={feed.data.stories} />
          </main>
        )}

        <FloatingActions
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <Footer />

      </div>
    </>
  );
}

export default App;
