import React, { useState, FormEvent, useEffect } from 'react';
import { shortenUrl } from './services/shortenerService';
import { LinkIcon, ClipboardIcon, CheckIcon, TrashIcon } from './components/Icons';

interface ShortenedURL {
  id: string;
  original: string;
  short: string;
}

const App: React.FC = () => {
  const [longUrl, setLongUrl] = useState<string>('');
  const [alias, setAlias] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [history, setHistory] = useState<ShortenedURL[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('shortenedUrls');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem('shortenedUrls');
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setCopiedUrl(null);
    setIsLoading(true);

    try {
      const shortUrl = await shortenUrl(longUrl, alias, customDomain);
      const newItem: ShortenedURL = { 
        id: new Date().toISOString(),
        original: longUrl, 
        short: shortUrl 
      };
      
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('shortenedUrls', JSON.stringify(updatedHistory));

      setLongUrl('');
      setAlias('');
      setCustomDomain('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
  };
  
  useEffect(() => {
    if (copiedUrl) {
      const timer = setTimeout(() => {
        setCopiedUrl(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedUrl]);

  const handleClearHistory = () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to clear your history? This action cannot be undone.'
    );
    if (isConfirmed) {
      localStorage.removeItem('shortenedUrls');
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative z-10">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
            style={{ textShadow: '0 0 15px rgba(192, 132, 252, 0.5), 0 0 30px rgba(236, 72, 153, 0.3)' }}
          >
            link by Poorva
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-slate-300 max-w-md mx-auto">
            The simplest way to shorten your long URLs. Fast, free, and easy to use.
          </p>
        </header>

        <main>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="longUrl" className="sr-only">Long URL</label>
                <div className="relative">
                   <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="longUrl"
                    type="url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://your-very-long-url.com/goes-here"
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="alias" className="text-sm font-medium text-slate-300 mb-2 block">Custom Alias (Optional)</label>
                <div className="relative">
                  <input
                    id="alias"
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="e.g., my-awesome-link"
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="customDomain" className="text-sm font-medium text-slate-300 mb-2 block">Custom Domain (Optional)</label>
                <div className="relative">
                  <input
                    id="customDomain"
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g., my.domain.com"
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 whitespace-nowrap mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                   <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Shortening...
                   </>
                ) : 'Shorten URL'}
              </button>
            </form>
            {error && <p className="mt-4 text-center text-red-400 animate-fade-in">{error}</p>}
          </div>

          {history.length > 0 && (
            <section className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-200">History</h2>
                <button onClick={handleClearHistory} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors duration-300">
                  <TrashIcon className="h-4 w-4" />
                  Clear History
                </button>
              </div>
              <div className="space-y-4">
                {history.map((item, index) => {
                    const isCopied = copiedUrl === item.short;
                    return (
                        <div key={item.id} className={`bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-4 sm:p-6 border border-white/20 ${index === 0 ? 'animate-fade-in' : ''}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm text-slate-400 mb-1">Original URL</p>
                                    <p className="text-slate-200 truncate" title={item.original}>{item.original}</p>
                                </div>
                                <div className="md:border-l md:border-slate-600 md:pl-6 flex-1 flex flex-col md:items-end">
                                   <p className="text-sm text-slate-400 mb-1">Shortened Link</p>
                                    <div className="flex items-center gap-4 w-full justify-between md:justify-end">
                                       <a href={item.short} target="_blank" rel="noopener noreferrer" className="text-purple-400 font-semibold hover:underline truncate">
                                            {item.short.replace(/^https?:\/\//, '')}
                                       </a>
                                       <button onClick={() => handleCopy(item.short)} className={`flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-300 ${isCopied ? 'bg-green-500/80 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}>
                                          {isCopied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                                          {isCopied ? 'Copied!' : 'Copy'}
                                       </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;