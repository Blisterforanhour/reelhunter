export const APP_CONFIG = {
  MAIN_DOMAIN: 'reelapps.co.za',
  APPS: {
    REELHUNTER: {
      name: 'ReelHunter',
      domain: 'reelhunter.reelapps.co.za',
      port: 5175,
      description: 'AI-powered recruiter matching platform'
    },
    REELCV: {
      name: 'ReelCV',
      domain: 'reelcv.reelapps.co.za',
      port: 5176,
      description: 'Interactive CV builder with video integration'
    },
    REELPERSONA: {
      name: 'ReelPersona',
      domain: 'reelpersona.reelapps.co.za',
      port: 5177,
      description: 'AI personality analysis for professionals'
    },
    REELPROJECTS: {
      name: 'ReelProjects',
      domain: 'reelprojects.reelapps.co.za',
      port: 5178,
      description: 'Project showcase and portfolio builder'
    },
    REELSKILLS: {
      name: 'ReelSkills',
      domain: 'reelskills.reelapps.co.za',
      port: 5179,
      description: 'Skills assessment and verification platform'
    }
  }
};

export const getAppConfig = (appName: keyof typeof APP_CONFIG.APPS) => {
  return APP_CONFIG.APPS[appName];
};

export const getCurrentAppConfig = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  for (const [key, config] of Object.entries(APP_CONFIG.APPS)) {
    if (hostname.includes(config.domain) || hostname.includes(`localhost:${config.port}`)) {
      return { key: key as keyof typeof APP_CONFIG.APPS, ...config };
    }
  }
  
  return null;
};