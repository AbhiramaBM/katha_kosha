import React, { createContext, useContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const translations = {
  kn: {
    // Common & Branding
    appName: 'ಕನ್ನಡ ಕಥಾ ಕೋಶ',
    appSubtitle: 'ಡಿಜಿಟಲ್ ಸಾಹಿತ್ಯ ಭಂಡಾರ',
    headerTitle: 'ಕನ್ನಡ ಕಥಾ ಕೋಶ • ಸಾಹಿತ್ಯ ಭಂಡಾರ',
    platformTag: 'ಕನ್ನಡ ಕಥಾ ಕೋಶ • ಸಾಹಿತ್ಯ ವೇದಿಕೆ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    save: 'ಉಳಿಸಿ',
    saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    cancel: 'ರದ್ದುಮಾಡಿ',
    edit: 'ತಿದ್ದು',
    delete: 'ಅಳಿಸಿ',
    search: 'ಹುಡುಕಿ',
    all: 'ಎಲ್ಲವೂ',
    read: 'ಓದಿ',
    back: 'ಹಿಂದಕ್ಕೆ',
    actions: 'ಕ್ರಮಗಳು',
    action: 'ಕ್ರಮ',
    status: 'ಸ್ಥಿತಿ',
    format: 'ರೂಪ',
    published: 'ಪ್ರಕಟಿತ',
    draft: 'ಕರಡು',
    textFormat: '📝 ಪಠ್ಯ',
    pdfFormat: '📄 PDF',
    unknownAuthor: 'ಅಜ್ಞಾತ ಲೇಖಕರು',
    worksCount: 'ಕೃತಿಗಳು',
    toggleTheme: 'ಥೀಮ್ ಬದಲಿಸಿ',
    openMenu: 'ಮೆನು ತೆರೆಯಿರಿ',
    close: 'ಮುಚ್ಚಿ',

    // Navigation & Roles
    navHome: 'ಮುಖಪುಟ',
    navStories: 'ಕಥೆಗಳು',
    navNewStory: 'ಹೊಸ ಕಥೆ',
    navAuthors: 'ಸಾಹಿತಿಗಳು',
    navUsers: 'ಬಳಕೆದಾರರು',
    signOut: 'ಲಾಗೌಟ್',
    roleAdmin: 'ಆಡಳಿತಗಾರ',
    roleEditor: 'ಸಂಪಾದಕರು',
    roleReader: 'ಓದುಗರು',
    roleUser: 'ಓದುಗರು (ಬಳಕೆದಾರ)',
    userFallback: 'ಬಳಕೆದಾರರು',

    // Login & Register
    loginWelcome: 'ಸ್ವಾಗತ',
    loginSubtitle: 'ಕನ್ನಡ ಕಥೆಗಳು ಹಾಗೂ ಸಾಹಿತಿಗಳ ಮುಕ್ತ ಡಿಜಿಟಲ್ ಭಂಡಾರ',
    signInTab: 'ಲಾಗಿನ್',
    registerTab: 'ಹೊಸ ಖಾತೆ',
    fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    fullNamePlaceholder: 'ಉದಾ: ಕುವೆಂಪು',
    emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
    confirmPasswordLabel: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
    signInBtn: 'ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಿ',
    registerBtn: 'ನೋಂದಣಿ ಮಾಡಿ',
    verifying: 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...',
    registering: 'ಖಾತೆ ಸೃಷ್ಟಿಸಲಾಗುತ್ತಿದೆ...',
    demoCredentialsTitle: 'ಡೆಮೊ ಲಾಗಿನ್ ವಿವರಗಳು',
    demoAdminRole: 'ಮುಖ್ಯಸ್ಥರು (Admin):',
    demoEditorRole: 'ಸಂಪಾದಕರು (Editor):',

    // Dashboard
    dashGreeting: 'ನಮಸ್ಕಾರ',
    dashFriend: 'ಸ್ನೇಹಿತರೆ',
    dashBannerDesc: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಲೋಕದ ಅಮೂಲ್ಯ ಕೃತಿಗಳು ಹಾಗೂ ಲೇಖಕರ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಸುಲಭವಾಗಿ ಓದಬಹುದು ಮತ್ತು ನಿರ್ವಹಿಸಬಹುದು.',
    browseStories: 'ಕಥೆಗಳನ್ನು ಓದಿ',
    totalStories: 'ಒಟ್ಟು ಕಥೆಗಳು',
    totalStoriesSub: 'ದಾಖಲಿತ ಕೃತಿಗಳು',
    authorsCount: 'ಸಾಹಿತಿಗಳು',
    authorsCountSub: 'ಪ್ರಮುಖ ಲೇಖಕರು',
    publishedStories: 'ಪ್ರಕಟಿತ ಕೃತಿಗಳು',
    publishedStoriesSub: 'ಓದಲು ಸಿದ್ಧವಾಗಿವೆ',
    recentStories: 'ಇತ್ತೀಚಿನ ಕಥೆಗಳು',
    recentStoriesSub: 'ಓದಲು ಯಾವುದೇ ಕಥೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ',
    viewAllStories: 'ಎಲ್ಲಾ ಕಥೆಗಳು',
    colTitle: 'ಕಥೆ',
    colAuthor: 'ಸಾಹಿತಿ',
    colFormat: 'ರೂಪ',
    colAction: 'ಕ್ರಮ',
    noRecentStories: 'ಯಾವುದೇ ಕಥೆಗಳು ಲಭ್ಯವಿಲ್ಲ',
    featuredAuthors: 'ಸಾಹಿತಿಗಳು',
    featuredAuthorsSub: 'ಪ್ರಮುಖ ಸಾಹಿತಿಗಳ ವಿವರ',
    viewAllLink: 'ಎಲ್ಲಾ →',
    viewAllAuthorsDetails: 'ಸಾಹಿತಿಗಳ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ →',

    // Stories Archive
    storiesArchiveTitle: 'ಕಥಾ ಭಂಡಾರ',
    storiesArchiveDesc: 'ಕನ್ನಡ ಸಾಹಿತ್ಯದ ಕಥೆಗಳು, ಕಾದಂಬರಿಗಳು ಹಾಗೂ ಹಸ್ತಪ್ರತಿಗಳ ಸಂಗ್ರಹ',
    searchStoriesPlaceholder: 'ಕಥೆಯ ಶೀರ್ಷಿಕೆ ಅಥವಾ ವಿವರ ಹುಡುಕಿ...',
    allAuthorsDropdown: 'ಎಲ್ಲಾ ಸಾಹಿತಿಗಳು',
    allFormatsDropdown: 'ಎಲ್ಲಾ ರೂಪಗಳು',
    textFormatOnly: 'ಪಠ್ಯ (Text)',
    pdfFormatOnly: 'ಪಿಡಿಎಫ್ (PDF)',
    clearFilters: 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ',
    noStoriesFound: 'ಯಾವುದೇ ಕಥೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    tryAdjustingSearch: 'ಹುಡುಕಾಟದ ಪದಗಳನ್ನು ಬದಲಾಯಿಸಿ ಅಥವಾ ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ',

    // Authors Directory
    authorsPageTitle: 'ಕನ್ನಡ ಸಾಹಿತಿಗಳು',
    authorsPageDesc: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ದಿಗ್ಗಜರ ವಿವರಗಳು ಹಾಗೂ ಅವರ ಕೃತಿಗಳ ಸಂಗ್ರಹ',
    addNewAuthor: '+ ಹೊಸ ಸಾಹಿತಿ ಸೇರಿಸಿ',
    searchAuthorsPlaceholder: 'ಸಾಹಿತಿಯ ಹೆಸರು ಅಥವಾ ಊರು ಹುಡುಕಿ...',
    authorPlace: 'ಸ್ಥಳ',
    authorPeriod: 'ಕಾಲ',
    storiesAvailableBadge: 'ಕೃತಿಗಳು ಲಭ್ಯ',
    readWorksBtn: 'ಕೃತಿಗಳನ್ನು ಓದಿ',
    noAuthorsFound: 'ಯಾವುದೇ ಸಾಹಿತಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    modalAddAuthor: 'ಹೊಸ ಸಾಹಿತಿ ಸೇರ್ಪಡೆ',
    modalEditAuthor: 'ಸಾಹಿತಿಯ ವಿವರ ತಿದ್ದುಪಡಿ',
    nameKnLabel: 'ಹೆಸರು (ಕನ್ನಡ)',
    nameEnLabel: 'ಹೆಸರು (ಇಂಗ್ಲಿಷ್)',
    birthYearLabel: 'ಜನನ ವರ್ಷ',
    deathYearLabel: 'ನಿಧನ ವರ್ಷ',
    placeLabel: 'ಸ್ಥಳ / ಜಿಲ್ಲೆ',
    bioLabel: 'ಸಂಕ್ಷಿಪ್ತ ಪರಿಚಯ',

    // Story Editor
    editorNewStoryTitle: 'ಹೊಸ ಕಥೆ ಸೇರ್ಪಡೆ',
    editorEditStoryTitle: 'ಕಥೆಯ ವಿವರ ತಿದ್ದುಪಡಿ',
    authorSelectLabel: 'ಸಾಹಿತಿ',
    titleKnLabel: 'ಕಥೆಯ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)',
    titleEnLabel: 'ಶೀರ್ಷಿಕೆ (ಇಂಗ್ಲಿಷ್)',
    genreLabel: 'ಪ್ರಕಾರ / ಸಾಹಿತ್ಯ ರೂಪ',
    pubYearLabel: 'ಪ್ರಕಟಿತ ವರ್ಷ',
    summaryLabel: 'ಸಂಕ್ಷಿಪ್ತ ಸಾರಾಂಶ',
    contentTypeLabel: 'ಕೃತಿಯ ರೂಪ',
    optDigitalText: '📝 ಡಿಜಿಟಲ್ ಪಠ್ಯ (Text)',
    optArchivalPdf: '📄 PDF / ಹಸ್ತಪ್ರತಿ ದಾಖಲೆ',
    fullTextLabel: 'ಕಥೆಯ ಪೂರ್ಣ ಪಠ್ಯ',
    selectPdfLabel: 'ಪಿಡಿಎಫ್ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ',
    publicationStatusLabel: 'ಪ್ರಕಟಣೆ ಸ್ಥಿತಿ',
    optPublishedPublic: 'ಪ್ರಕಟಿತ (ಸಾರ್ವಜನಿಕವಾಗಿ ಲಭ್ಯ)',
    optDraftPrivate: 'ಕರಡು (ಅಂತಿಮವಾಗಿಲ್ಲ)',
    saveStoryBtn: 'ಕೃತಿ ಉಳಿಸಿ',

    // Reader Modal
    storyReaderTitle: 'ಕಥಾ ವಾಚನ',
    authorPrefix: 'ಸಾಹಿತಿ: ',
    pdfDocumentTitle: 'ಪಿಡಿಎಫ್ / ಹಸ್ತಪ್ರತಿ ದಾಖಲೆ',
    pdfDocumentDesc: 'ಈ ಕೃತಿಯು ಮೂಲ ಹಸ್ತಪ್ರತಿಯ ಡಿಜಿಟಲ್ PDF ರೂಪದಲ್ಲಿದೆ. ವೀಕ್ಷಿಸಲು ಅಥವಾ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ.',
    openPdfBtn: 'PDF ವೀಕ್ಷಿಸಿ / ಡೌನ್‌ಲೋಡ್',
    noPdfAttached: 'ಪಿಡಿಎಫ್ ಫೈಲ್ ಇನ್ನೂ ಲಗತ್ತಿಸಿಲ್ಲ',

    // Users List
    usersTitle: 'ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ',
    usersSubtitle: 'ವ್ಯವಸ್ಥೆಯ ಬಳಕೆದಾರರು ಹಾಗೂ ಅವರ ಅಧಿಕಾರ ಮಟ್ಟಗಳು',
    addNewUser: '+ ಹೊಸ ಬಳಕೆದಾರ',
    colUserName: 'ಹೆಸರು',
    colUserEmail: 'ಇಮೇಲ್',
    colUserRole: 'ಪಾತ್ರ / ಅಧಿಕಾರ',
    colUserStatus: 'ಸ್ಥಿತಿ',
    colUserActions: 'ಕ್ರಮಗಳು',
    resetPasswordBtn: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ',
    deactivateBtn: 'ಅಮಾನತುಗೊಳಿಸಿ',
    activateBtn: 'ಸಕ್ರಿಯಗೊಳಿಸಿ',
    roleAdminOption: 'ಆಡಳಿತಗಾರ (Admin)',
    roleEditorOption: 'ಸಂಪಾದಕರು (Editor)',
    roleUserOption: 'ಓದುಗರು (Reader)',
    activeStatus: 'ಸಕ್ರಿಯ',
    inactiveStatus: 'ಅಮಾನತು'
  },
  en: {
    // Common & Branding
    appName: 'Kannada Katha Kosha',
    appSubtitle: 'Digital Literary Archive',
    headerTitle: 'Kannada Katha Kosha • Literary Archive',
    platformTag: 'Kannada Katha Kosha • Literary Platform',
    loading: 'Loading...',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    all: 'All',
    read: 'Read',
    back: 'Back',
    actions: 'Actions',
    action: 'Action',
    status: 'Status',
    format: 'Format',
    published: 'Published',
    draft: 'Draft',
    textFormat: '📝 Text',
    pdfFormat: '📄 PDF',
    unknownAuthor: 'Unknown Author',
    worksCount: 'works',
    toggleTheme: 'Toggle theme',
    openMenu: 'Open menu',
    close: 'Close',

    // Navigation & Roles
    navHome: 'Home',
    navStories: 'Stories',
    navNewStory: 'New Story',
    navAuthors: 'Authors',
    navUsers: 'Users',
    signOut: 'Sign Out',
    roleAdmin: 'Admin',
    roleEditor: 'Editor',
    roleReader: 'Reader',
    roleUser: 'User (Read Only)',
    userFallback: 'User',

    // Login & Register
    loginWelcome: 'Welcome',
    loginSubtitle: 'Open digital archive of Kannada stories and distinguished authors',
    signInTab: 'Sign In',
    registerTab: 'Create Account',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. Kuvempu',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    signInBtn: 'Sign In',
    registerBtn: 'Create Account',
    verifying: 'Signing in...',
    registering: 'Creating account...',
    demoCredentialsTitle: 'Demo Credentials',
    demoAdminRole: 'Admin:',
    demoEditorRole: 'Editor:',

    // Dashboard
    dashGreeting: 'Welcome',
    dashFriend: 'Friend',
    dashBannerDesc: 'Explore, read, and manage cherished literary works and authors from the world of Kannada literature.',
    browseStories: 'Browse Stories',
    totalStories: 'Total Stories',
    totalStoriesSub: 'Archived Works',
    authorsCount: 'Authors',
    authorsCountSub: 'Distinguished Writers',
    publishedStories: 'Published Stories',
    publishedStoriesSub: 'Ready to Read',
    recentStories: 'Recent Stories',
    recentStoriesSub: 'Click on any story to read',
    viewAllStories: 'All Stories',
    colTitle: 'Story',
    colAuthor: 'Author',
    colFormat: 'Format',
    colAction: 'Action',
    noRecentStories: 'No stories available',
    featuredAuthors: 'Authors',
    featuredAuthorsSub: 'Featured Literary Figures',
    viewAllLink: 'All →',
    viewAllAuthorsDetails: 'View all authors directory →',

    // Stories Archive
    storiesArchiveTitle: 'Stories Archive',
    storiesArchiveDesc: 'Collection of Kannada stories, novels, and digital manuscripts',
    searchStoriesPlaceholder: 'Search stories by title or description...',
    allAuthorsDropdown: 'All Authors',
    allFormatsDropdown: 'All Formats',
    textFormatOnly: 'Text format',
    pdfFormatOnly: 'PDF format',
    clearFilters: 'Clear filters',
    noStoriesFound: 'No stories found',
    tryAdjustingSearch: 'Try adjusting your search query or clear filters',

    // Authors Directory
    authorsPageTitle: 'Kannada Authors',
    authorsPageDesc: 'Biographical archive of renowned Kannada authors and their works',
    addNewAuthor: '+ Add New Author',
    searchAuthorsPlaceholder: 'Search author by name or place...',
    authorPlace: 'Place',
    authorPeriod: 'Period',
    storiesAvailableBadge: 'works available',
    readWorksBtn: 'Read Works',
    noAuthorsFound: 'No authors found',
    modalAddAuthor: 'Add New Author',
    modalEditAuthor: 'Edit Author Details',
    nameKnLabel: 'Name (Kannada)',
    nameEnLabel: 'Name (English)',
    birthYearLabel: 'Birth Year',
    deathYearLabel: 'Death Year',
    placeLabel: 'Place / District',
    bioLabel: 'Short Biography',

    // Story Editor
    editorNewStoryTitle: 'Add New Story',
    editorEditStoryTitle: 'Edit Story Details',
    authorSelectLabel: 'Author',
    titleKnLabel: 'Story Title (Kannada)',
    titleEnLabel: 'Story Title (English)',
    genreLabel: 'Genre / Literary Form',
    pubYearLabel: 'Published Year',
    summaryLabel: 'Brief Summary',
    contentTypeLabel: 'Content Format',
    optDigitalText: '📝 Digital Text',
    optArchivalPdf: '📄 PDF / Manuscript File',
    fullTextLabel: 'Story Full Text',
    selectPdfLabel: 'Select PDF File',
    publicationStatusLabel: 'Publication Status',
    optPublishedPublic: 'Published (Publicly Visible)',
    optDraftPrivate: 'Draft (Private)',
    saveStoryBtn: 'Save Story',

    // Reader Modal
    storyReaderTitle: 'Story Reader',
    authorPrefix: 'Author: ',
    pdfDocumentTitle: 'Archival PDF Manuscript',
    pdfDocumentDesc: 'This work is preserved as an archival PDF manuscript. Click below to view or download.',
    openPdfBtn: 'View / Download PDF',
    noPdfAttached: 'No PDF file attached yet',

    // Users List
    usersTitle: 'User Management',
    usersSubtitle: 'System users and access control permissions',
    addNewUser: '+ Add User',
    colUserName: 'Name',
    colUserEmail: 'Email',
    colUserRole: 'Role',
    colUserStatus: 'Status',
    colUserActions: 'Actions',
    resetPasswordBtn: 'Reset Password',
    deactivateBtn: 'Deactivate',
    activateBtn: 'Activate',
    roleAdminOption: 'Admin',
    roleEditorOption: 'Editor',
    roleUserOption: 'Reader',
    activeStatus: 'Active',
    inactiveStatus: 'Inactive'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'kn' || saved === 'en') return saved;
    return 'kn';
  });

  const setLang = (newLang) => {
    if (newLang === 'kn' || newLang === 'en') {
      setLangState(newLang);
      localStorage.setItem('language', newLang);
    }
  };

  const toggleLanguage = () => {
    setLangState((prev) => {
      const next = prev === 'kn' ? 'en' : 'kn';
      localStorage.setItem('language', next);
      return next;
    });
  };

  // Helper function to get text by key
  const t = (key, fallback = '') => {
    const dict = translations[lang] || translations.kn;
    if (dict[key] !== undefined) return dict[key];
    if (translations.kn[key] !== undefined) return translations.kn[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
