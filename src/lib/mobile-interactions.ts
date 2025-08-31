// Mobile touch interactions and gesture handling
// Optimizes touch interactions for mobile booking flow

'use client';

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'long-press';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  duration: number;
  distance?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface SwipeConfig {
  threshold: number; // Minimum distance for swipe
  velocity: number;  // Minimum velocity
  direction: 'horizontal' | 'vertical' | 'both';
}

// Touch interaction utilities
export class MobileInteractions {
  private static touchStartTime: number = 0;
  private static touchStartX: number = 0;
  private static touchStartY: number = 0;
  private static longPressTimer: NodeJS.Timeout | null = null;

  // Enhanced touch event handling
  static setupTouchHandlers(element: HTMLElement, callbacks: {
    onTap?: (gesture: TouchGesture) => void;
    onSwipe?: (gesture: TouchGesture) => void;
    onLongPress?: (gesture: TouchGesture) => void;
    onPinch?: (gesture: TouchGesture) => void;
  }) {
    let touchStartData: { x: number; y: number; time: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartData = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Set up long press detection
      if (callbacks.onLongPress) {
        this.longPressTimer = setTimeout(() => {
          if (touchStartData) {
            callbacks.onLongPress!({
              type: 'long-press',
              startX: touchStartData.x,
              startY: touchStartData.y,
              duration: Date.now() - touchStartData.time,
            });
          }
        }, 500); // 500ms for long press
      }

      // Prevent default to avoid 300ms delay
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartData) return;

      const touch = e.changedTouches[0];
      const endTime = Date.now();
      const duration = endTime - touchStartData.time;
      const deltaX = touch.clientX - touchStartData.x;
      const deltaY = touch.clientY - touchStartData.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Clear long press timer
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      // Determine gesture type
      if (distance < 10 && duration < 300) {
        // Tap gesture
        callbacks.onTap?.({
          type: 'tap',
          startX: touchStartData.x,
          startY: touchStartData.y,
          endX: touch.clientX,
          endY: touch.clientY,
          duration,
          distance,
        });
      } else if (distance > 50) {
        // Swipe gesture
        const direction = Math.abs(deltaX) > Math.abs(deltaY) 
          ? (deltaX > 0 ? 'right' : 'left')
          : (deltaY > 0 ? 'down' : 'up');

        callbacks.onSwipe?.({
          type: 'swipe',
          startX: touchStartData.x,
          startY: touchStartData.y,
          endX: touch.clientX,
          endY: touch.clientY,
          duration,
          distance,
          direction,
        });
      }

      touchStartData = null;
    };

    const handleTouchCancel = () => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      touchStartData = null;
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
      }
    };
  }

  // Optimize touch targets for mobile
  static optimizeTouchTargets() {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      /* Ensure minimum touch target size */
      button, a, input, select, textarea {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Optimize button spacing for touch */
      .touch-optimized button + button {
        margin-left: 8px;
      }
      
      /* Improve form field spacing */
      .touch-optimized input, 
      .touch-optimized select, 
      .touch-optimized textarea {
        padding: 12px 16px;
        margin-bottom: 16px;
      }
      
      /* Enhance focus indicators for touch */
      button:focus-visible,
      a:focus-visible,
      input:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Detect mobile device capabilities
  static detectMobileCapabilities() {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        hasTouch: false,
        isIOS: false,
        isAndroid: false,
        supportsVibration: false,
        supportsOrientation: false,
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    
    return {
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isAndroid: /android/.test(userAgent),
      supportsVibration: 'vibrate' in navigator,
      supportsOrientation: 'orientation' in window,
      supportsInstall: 'serviceWorker' in navigator && 'PushManager' in window,
    };
  }

  // Haptic feedback for mobile interactions
  static provideFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      // Vibration not supported or blocked
      console.debug('Vibration not available:', error);
    }
  }

  // Optimize scrolling for mobile
  static optimizeScrolling() {
    if (typeof window === 'undefined') return;

    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Optimize scroll performance
    const style = document.createElement('style');
    style.textContent = `
      /* Optimize scrolling performance */
      * {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Prevent overscroll bounce on iOS */
      body {
        overscroll-behavior: none;
      }
      
      /* Optimize scroll containers */
      .scroll-container {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Handle orientation changes
  static handleOrientationChange(callback: (orientation: string) => void) {
    if (typeof window === 'undefined' || !('orientation' in window)) {
      return () => {}; // Return empty cleanup function
    }

    const handleChange = () => {
      const orientation = window.orientation === 0 || window.orientation === 180 
        ? 'portrait' 
        : 'landscape';
      callback(orientation);
    };

    window.addEventListener('orientationchange', handleChange);
    
    // Initial call
    handleChange();

    return () => {
      window.removeEventListener('orientationchange', handleChange);
    };
  }

  // Optimize form inputs for mobile
  static optimizeMobileInputs() {
    if (typeof window === 'undefined') return;

    // Add mobile-specific input optimizations
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      
      // Optimize input types for mobile keyboards
      switch (element.type) {
        case 'email':
          element.setAttribute('inputmode', 'email');
          element.setAttribute('autocomplete', 'email');
          break;
        case 'tel':
          element.setAttribute('inputmode', 'tel');
          element.setAttribute('autocomplete', 'tel');
          break;
        case 'number':
          element.setAttribute('inputmode', 'numeric');
          break;
        case 'url':
          element.setAttribute('inputmode', 'url');
          break;
        case 'search':
          element.setAttribute('inputmode', 'search');
          break;
      }

      // Prevent zoom on focus for iOS
      if (this.detectMobileCapabilities().isIOS) {
        element.style.fontSize = Math.max(16, parseInt(getComputedStyle(element).fontSize)) + 'px';
      }
    });
  }

  // Mobile-specific performance optimizations
  static optimizeMobilePerformance() {
    if (typeof window === 'undefined') return;

    // Reduce animations on low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          (navigator as any).deviceMemory <= 2;

    if (isLowEndDevice) {
      const style = document.createElement('style');
      style.textContent = `
        /* Reduce animations on low-end devices */
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Optimize images for mobile
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      
      // Add mobile-optimized sizes
      if (!img.sizes && img.srcset) {
        img.sizes = '(max-width: 768px) 100vw, 50vw';
      }
    });
  }
}

// React hook for mobile interactions
export function useMobileInteractions(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: {
    onTap?: (gesture: TouchGesture) => void;
    onSwipe?: (gesture: TouchGesture) => void;
    onLongPress?: (gesture: TouchGesture) => void;
  }
) {
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const cleanup = MobileInteractions.setupTouchHandlers(element, callbacks);
    return cleanup;
  }, [elementRef, callbacks]);
}

// React hook for mobile device detection
export function useMobileDevice() {
  const [capabilities, setCapabilities] = React.useState(() => 
    MobileInteractions.detectMobileCapabilities()
  );

  React.useEffect(() => {
    // Update capabilities on mount (for SSR)
    setCapabilities(MobileInteractions.detectMobileCapabilities());
  }, []);

  return capabilities;
}

// React hook for orientation handling
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const cleanup = MobileInteractions.handleOrientationChange(setOrientation);
    return cleanup;
  }, []);

  return orientation;
}

// Mobile-specific utilities
export const mobileUtils = {
  // Check if device supports PWA installation
  canInstallPWA(): boolean {
    return typeof window !== 'undefined' && 
           'serviceWorker' in navigator && 
           'PushManager' in window;
  },

  // Get device pixel ratio for high-DPI displays
  getDevicePixelRatio(): number {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  },

  // Check if running as PWA
  isPWA(): boolean {
    return typeof window !== 'undefined' && 
           (window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true);
  },

  // Get safe area insets for devices with notches
  getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    if (typeof window === 'undefined') {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
  },

  // Optimize viewport for mobile
  optimizeViewport(): void {
    if (typeof document === 'undefined') return;

    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }

    // Enhanced viewport configuration for mobile
    viewport.content = [
      'width=device-width',
      'initial-scale=1',
      'maximum-scale=5',
      'user-scalable=yes',
      'viewport-fit=cover', // Support for devices with notches
    ].join(', ');
  },

  // Add mobile-specific meta tags
  addMobileMeta(): void {
    if (typeof document === 'undefined') return;

    const metaTags = [
      // iOS-specific
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'Filip Prague Tours' },
      
      // Android-specific
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#3b82f6' },
      
      // Windows-specific
      { name: 'msapplication-TileColor', content: '#3b82f6' },
      { name: 'msapplication-tap-highlight', content: 'no' },
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    });
  },
};

// Mobile booking flow optimizations
export const mobileBookingOptimizations = {
  // Optimize date picker for mobile
  optimizeDatePicker(container: HTMLElement): void {
    const dateInputs = container.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach((input) => {
      const element = input as HTMLInputElement;
      
      // Use native date picker on mobile
      if (MobileInteractions.detectMobileCapabilities().isMobile) {
        element.style.appearance = 'none';
        element.style.webkitAppearance = 'none';
        
        // Add custom styling for better mobile UX
        element.classList.add('mobile-date-picker');
      }
    });
  },

  // Optimize payment form for mobile
  optimizePaymentForm(container: HTMLElement): void {
    const paymentInputs = container.querySelectorAll('input[data-payment]');
    
    paymentInputs.forEach((input) => {
      const element = input as HTMLInputElement;
      
      // Optimize keyboard for different payment fields
      if (element.name?.includes('card')) {
        element.setAttribute('inputmode', 'numeric');
        element.setAttribute('pattern', '[0-9]*');
      }
      
      if (element.name?.includes('expiry')) {
        element.setAttribute('inputmode', 'numeric');
        element.setAttribute('pattern', '[0-9/]*');
      }
      
      if (element.name?.includes('cvc')) {
        element.setAttribute('inputmode', 'numeric');
        element.setAttribute('pattern', '[0-9]*');
      }
    });
  },

  // Add mobile-specific validation feedback
  enhanceMobileValidation(form: HTMLFormElement): void {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      
      element.addEventListener('invalid', (e) => {
        e.preventDefault();
        
        // Provide haptic feedback on validation error
        MobileInteractions.provideFeedback('medium');
        
        // Show custom validation message
        const errorElement = form.querySelector(`[data-error="${element.name}"]`);
        if (errorElement) {
          errorElement.textContent = element.validationMessage;
          errorElement.classList.add('show');
        }
      });
      
      element.addEventListener('input', () => {
        // Clear validation message on input
        const errorElement = form.querySelector(`[data-error="${element.name}"]`);
        if (errorElement) {
          errorElement.classList.remove('show');
        }
      });
    });
  },
};
