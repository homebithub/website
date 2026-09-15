type InstalledRelatedApp = {
  platform?: string;
  url?: string;
};

type RelatedAppsNavigator = Navigator & {
  getInstalledRelatedApps?: () => Promise<InstalledRelatedApp[]>;
};

/** Open the admin PWA when the browser can identify it, otherwise hand off to the browser. */
export async function openAdminDashboard(url: string): Promise<void> {
  if (typeof window === 'undefined' || !url) return;

  const openInBrowser = () => {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.assign(url);
  };

  const relatedApps = (navigator as RelatedAppsNavigator).getInstalledRelatedApps;
  if (typeof relatedApps === 'function') {
    try {
      const installed = await relatedApps.call(navigator);
      const adminOrigin = new URL(url, window.location.href).origin;
      const adminIsInstalled = installed.some((app) => {
        if (app.platform !== 'webapp' || !app.url) return false;
        try {
          return new URL(app.url, window.location.href).origin === adminOrigin;
        } catch {
          return false;
        }
      });

      if (adminIsInstalled) {
        // Let the operating system/browser resolve the installed web app.
        window.location.assign(url);
        return;
      }
    } catch {
      // Unsupported/blocked detection should never prevent navigation.
    }
  }

  openInBrowser();
}
