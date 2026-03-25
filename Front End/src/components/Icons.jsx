import React from 'react';

// Target/Goal Icon — compact bullseye
export const TargetIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.75" fill="none"/>
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.75" fill="none"/>
    <circle cx="12" cy="12" r="2.5" fill={color}/>
  </svg>
);

// Chart/Statistics Icon — bar chart
export const ChartIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="14" width="3" height="6" rx="1" fill={color}/>
    <rect x="10" y="10" width="3" height="10" rx="1" fill={color}/>
    <rect x="16" y="6" width="3" height="14" rx="1" fill={color}/>
  </svg>
);

// Checklist / Skills assessed
export const ChecklistIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 11l3 3 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1" stroke={color} strokeWidth="1.75" strokeLinecap="round" fill="none"/>
  </svg>
);

// Book/Learning Icon — open book
export const BookIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 5v14M4 6.5C4 5.67 5.5 5 7 5s3 .67 3 1.5v11c0 .83-1.5 1.5-3 1.5s-3-.67-3-1.5V6.5z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 6.5c0-.83-1.5-1.5-3-1.5s-3 .67-3 1.5v11c0 .83 1.5 1.5 3 1.5s3-.67 3-1.5V6.5z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Briefcase/Job Icon
export const BriefcaseIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="8" width="16" height="12" rx="1.5" stroke={color} strokeWidth="1.75" fill="none"/>
    <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14h.01M16 14h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Search Icon
export const SearchIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/>
    <path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Trending Up Icon
export const TrendingUpIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 6 23 6 23 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Checkmark Icon
export const CheckIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Arrow Right Icon
export const ArrowRightIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// User Icon
export const UserIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2"/>
  </svg>
);

// Settings Icon
export const SettingsIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Logout Icon
export const LogoutIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Home Icon
export const HomeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// File/Assessment Icon
export const FileIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Star/Favorite Icon
export const StarIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Chat / Message Icon
export const ChatIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Close / Minimize Icon
export const CloseIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Globe/World Icon
export const GlobeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M2 12H22M12 2C15 6 15 18 12 22C9 18 9 6 12 2Z" stroke={color} strokeWidth="2"/>
    <path d="M12 2C14.5 4.5 18.5 4.5 21 7M12 2C9.5 4.5 5.5 4.5 3 7M12 22C14.5 19.5 18.5 19.5 21 17M12 22C9.5 19.5 5.5 19.5 3 17" stroke={color} strokeWidth="2"/>
  </svg>
);

