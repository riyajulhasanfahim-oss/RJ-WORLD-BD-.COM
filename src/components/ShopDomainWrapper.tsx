import React, { useState, useEffect, createContext, useContext } from 'react';
import { rtdbGet } from '../lib/rtdb';
import ShopNotFound from './ShopNotFound';

interface ShopDomainContextType {
  vendorId: string | null;
  loading: boolean;
  isShopDomain: boolean;
  isNotFound: boolean;
}

const ShopDomainContext = createContext<ShopDomainContextType>({ 
  vendorId: null, 
  loading: false,
  isShopDomain: false,
  isNotFound: false
});

export const useShopDomain = () => useContext(ShopDomainContext);

export default function ShopDomainWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isShopDomain, setIsShopDomain] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkDomain = async () => {
      try {
        const hostname = (window.location.hostname || '').toLowerCase();
        let savedPrimaryDomain = '';
        try {
          savedPrimaryDomain = (localStorage.getItem('rj_primary_domain') || '').toLowerCase();
        } catch {}
        
        // Primary marketplace domains & development hosts
        const isMainDomain = 
          !hostname ||
          hostname === 'localhost' || 
          hostname === '127.0.0.1' ||
          hostname === '0.0.0.0' ||
          (Boolean(savedPrimaryDomain) && hostname.includes(savedPrimaryDomain)) ||
          hostname.includes('rjworldbd.com') ||
          hostname.includes('rjworld.com') ||
          hostname.includes('pages.dev') ||
          hostname.includes('workers.dev') ||
          hostname.includes('cloudflare') ||
          hostname.includes('run.app') || 
          hostname.includes('google.com') ||
          hostname.includes('ai.studio') ||
          hostname.includes('ais-') ||
          hostname.includes('webcontainer.io') ||
          hostname.includes('vercel.app') ||
          hostname.includes('netlify.app') ||
          hostname.includes('cloudworkstations.dev') ||
          hostname.includes('googleusercontent.com');

        if (isMainDomain) {
          const searchParams = new URLSearchParams(window.location.search);
          const testDomain = searchParams.get('test_shop_domain');
          
          if (!testDomain) {
            if (isMounted) {
              setIsShopDomain(false);
              setIsNotFound(false);
              setLoading(false);
            }
            return;
          }
          
          return checkDomainWithHost(testDomain);
        }

        // Check if this custom domain belongs to a specific vendor store
        return checkDomainWithHost(hostname);
      } catch (err) {
        console.warn("Domain check notice:", err);
        if (isMounted) {
          setIsShopDomain(false);
          setIsNotFound(false);
          setLoading(false);
        }
      }
    };

    const checkDomainWithHost = async (host: string) => {
      try {
        const profiles = await rtdbGet<Record<string, any>>('vendor_profiles', 2000);
        if (profiles && typeof profiles === 'object' && isMounted) {
          const lowerHost = host.toLowerCase().trim();
          for (const [vId, prof] of Object.entries(profiles)) {
            if (!prof || typeof prof !== 'object') continue;
            const freeDom = (prof.freeShopDomain || '').toLowerCase().trim();
            const customDom = (prof.customDomain || '').toLowerCase().trim();
            const isVerified = prof.verificationStatus === 'Verified' || prof.verified === true;

            if (freeDom === lowerHost || (customDom === lowerHost && isVerified)) {
              setVendorId(vId);
              setIsShopDomain(true);
              setIsNotFound(false);
              setLoading(false);
              return;
            }
          }
        }

        // If not a registered vendor store, gracefully default to main marketplace
        if (isMounted) {
          setIsShopDomain(false);
          setIsNotFound(false);
        }
      } catch (e) {
        console.warn("Domain routing fallback:", e);
        if (isMounted) {
          setIsShopDomain(false);
          setIsNotFound(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkDomain();

    return () => {
      isMounted = false;
    };
  }, []);

  // If it is explicitly an unverified/missing shop domain
  if (isShopDomain && isNotFound) {
    return <ShopNotFound />;
  }

  return (
    <ShopDomainContext.Provider value={{ vendorId, loading, isShopDomain, isNotFound }}>
      {children}
    </ShopDomainContext.Provider>
  );
}
