'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function ReCaptcha({ onVerify, onExpire }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  const handleLoad = useCallback(() => {
    if (containerRef.current && window.grecaptcha && widgetId.current === null) {
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        callback: onVerify,
        'expired-callback': onExpire,
        theme: 'dark',
      });
    }
  }, [onVerify, onExpire]);

  useEffect(() => {
    // If grecaptcha is already loaded, render immediately
    if (window.grecaptcha && window.grecaptcha.render) {
      handleLoad();
      return;
    }

    // Set the callback for when the script loads
    window.onRecaptchaLoad = handleLoad;

    // Check if script is already in DOM
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup
      window.onRecaptchaLoad = () => {};
    };
  }, [handleLoad]);

  return <div ref={containerRef} />;
}
