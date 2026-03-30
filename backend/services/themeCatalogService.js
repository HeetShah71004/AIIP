const FEATURED_THEMES = [
  {
    id: 'classic',
    packageName: 'local:classic',
    slug: 'classic',
    name: 'Classic',
    description: 'Balanced and ATS-friendly default template.',
    version: 'local',
    keywords: ['featured', 'classic', 'ats'],
    styleTags: ['Professional'],
    featured: true,
    installed: true,
    previewMode: 'local',
    npmUrl: '',
    repositoryUrl: ''
  },
  {
    id: 'modern',
    packageName: 'local:modern',
    slug: 'modern',
    name: 'Modern',
    description: 'Clean modern layout with strong visual hierarchy.',
    version: 'local',
    keywords: ['featured', 'modern'],
    styleTags: ['Modern'],
    featured: true,
    installed: true,
    previewMode: 'local',
    npmUrl: '',
    repositoryUrl: ''
  },
  {
    id: 'professional',
    packageName: 'local:professional',
    slug: 'professional',
    name: 'Professional',
    description: 'Conservative business-focused resume template.',
    version: 'local',
    keywords: ['featured', 'professional'],
    styleTags: ['Professional'],
    featured: true,
    installed: true,
    previewMode: 'local',
    npmUrl: '',
    repositoryUrl: ''
  },
  {
    id: 'creative',
    packageName: 'local:creative',
    slug: 'creative',
    name: 'Creative',
    description: 'Expressive design for design-forward profiles.',
    version: 'local',
    keywords: ['featured', 'creative'],
    styleTags: ['Creative'],
    featured: true,
    installed: true,
    previewMode: 'local',
    npmUrl: '',
    repositoryUrl: ''
  },
  {
    id: 'elegant',
    packageName: 'local:elegant',
    slug: 'elegant',
    name: 'Elegant',
    description: 'Elegant typography with refined spacing.',
    version: 'local',
    keywords: ['featured', 'elegant'],
    styleTags: ['Professional'],
    featured: true,
    installed: true,
    previewMode: 'local',
    npmUrl: '',
    repositoryUrl: ''
  },
  {
    id: 'midnight',
    packageName: 'local:midnight',
    slug: 'midnight',
    name: 'Midnight',
    description: 'High-contrast tech-style featured template.',
    version: 'local',
    keywords: ['featured', 'tech'],
    styleTags: ['Tech-Focused'],
    featured: true,
    installed: true,
    previewMode: 'local',
    npmUrl: '',
    repositoryUrl: ''
  }
];

const LOCAL_THEME_SLUGS = FEATURED_THEMES.map((theme) => theme.slug);

export const syncThemeCatalog = async () => {
  return {
    syncedAt: Date.now(),
    themes: [...FEATURED_THEMES]
  };
};

export const getThemeCatalog = async ({ search = '', style = 'All' } = {}) => {
  let themes = [...FEATURED_THEMES];

  if (style && style !== 'All') {
    themes = themes.filter((theme) => theme.styleTags.includes(style));
  }

  if (search) {
    const query = String(search).toLowerCase();
    themes = themes.filter((theme) => {
      const haystack = `${theme.name} ${theme.slug} ${theme.description} ${theme.styleTags.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  return {
    syncedAt: Date.now(),
    total: themes.length,
    page: 1,
    limit: themes.length,
    styles: ['All', 'Modern', 'Creative', 'Tech-Focused', 'Professional'],
    featuredThemes: themes,
    themes,
    localThemeSlugs: LOCAL_THEME_SLUGS
  };
};

export const getThemeBySlug = async (slug) => {
  return FEATURED_THEMES.find((theme) => theme.slug === slug) || null;
};

export const getLocalThemeSlugs = () => [...LOCAL_THEME_SLUGS];
