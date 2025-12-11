import React from 'react';

export type IconName = string;

interface IconProps {
  className?: string;
  name: IconName;
}

export const OwnerIcon: React.FC<IconProps> = ({ className, name }) => {
  const sizeClass = className || "w-6 h-6";

  const icons: Record<string, React.ReactNode> = {
    // ==========================================
    // AUTHENTICATION ILLUSTRATIONS (Large 3D)
    // ==========================================
    
    // 3D Key & Lock (Login)
    AuthLogin3D: (
      <g filter="drop-shadow(0 20px 30px rgba(0,0,0,0.3))">
         <defs>
             <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#FFD700" />
                 <stop offset="50%" stopColor="#FDB931" />
                 <stop offset="100%" stopColor="#C49102" />
             </linearGradient>
             <linearGradient id="silverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#E0E0E0" />
                 <stop offset="100%" stopColor="#757575" />
             </linearGradient>
         </defs>
         {/* Shield Backing */}
         <path d="M12 2 L22 7 V12 C22 17 17 21 12 22 C7 21 2 17 2 12 V7 L12 2Z" fill="#1d2a78" stroke="url(#silverGrad)" strokeWidth="0.5" opacity="0.9" transform="scale(0.8) translate(3,3)" />
         
         {/* The Key */}
         <g transform="translate(4, 4) rotate(-45 12 12)">
             <circle cx="8" cy="8" r="4" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />
             <path d="M11 11 L19 19 M19 19 L19 22 M16 16 L16 19" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
         </g>
         
         {/* Glow */}
         <circle cx="12" cy="12" r="8" fill="url(#goldGrad)" opacity="0.2" filter="blur(5px)" />
      </g>
    ),

    // 3D User Card (Registration)
    AuthSignup3D: (
      <g filter="drop-shadow(0 20px 30px rgba(0,0,0,0.3))">
          <defs>
              <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#eef2f6" />
              </linearGradient>
          </defs>
          {/* Floating Card */}
          <rect x="4" y="4" width="16" height="12" rx="2" fill="url(#cardGrad)" stroke="#cbd5e1" strokeWidth="0.5" transform="rotate(-5 12 12)" />
          <rect x="4" y="8" width="16" height="12" rx="2" fill="#3041c7" stroke="#1d2a78" strokeWidth="0.5" transform="rotate(5 12 12)" />
          
          {/* Avatar on Card */}
          <circle cx="12" cy="12" r="3" fill="#f5a623" transform="rotate(5 12 12)" />
          <path d="M9 16 Q12 18 15 16" stroke="white" strokeWidth="1" strokeLinecap="round" transform="rotate(5 12 12)" />
          
          {/* Floating Plus */}
          <circle cx="18" cy="6" r="3" fill="#4CAF50" />
          <path d="M18 4 V8 M16 6 H20" stroke="white" strokeWidth="1.5" />
      </g>
    ),

    // 3D Lock/Mail (Forgot Password)
    AuthForgot3D: (
      <g filter="drop-shadow(0 20px 30px rgba(0,0,0,0.3))">
          <path d="M2 8 L12 16 L22 8 V20 C22 21 21 22 20 22 H4 C3 22 2 21 2 20 V8 Z" fill="#e9eaff" stroke="#3041c7" strokeWidth="0.5" />
          <path d="M2 8 L12 2 L22 8" fill="#dbeafe" stroke="#3041c7" strokeWidth="0.5" />
          <circle cx="12" cy="12" r="4" fill="#f5a623" />
          <text x="12" y="16" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">?</text>
      </g>
    ),

    // 3D Reset (Change Password)
    AuthReset3D: (
      <g filter="drop-shadow(0 20px 30px rgba(0,0,0,0.3))">
          <circle cx="12" cy="12" r="8" fill="none" stroke="#3041c7" strokeWidth="2.5" strokeDasharray="30 15" transform="rotate(45 12 12)" />
          <path d="M12 7 V12 L15 15" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" />
          <rect x="9" y="9" width="6" height="5" rx="1" fill="#1d2a78" />
          <path d="M10 9 V7 A2 2 0 0 1 14 7 V9" fill="none" stroke="#1d2a78" strokeWidth="1.5" />
      </g>
    ),

    // 3D House (Dashboard)
    Home: (
      <g>
        <defs>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="50%" stopColor="#005A9C" />
            <stop offset="100%" stopColor="#003366" />
          </linearGradient>
          <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
          <filter id="dropShadow" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1"/> 
            <feOffset dx="0" dy="1" result="offsetblur"/> 
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge> 
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#dropShadow)">
           <path d="M12 2 L22 11 H19 V21 C19 21.5 18.5 22 18 22 H6 C5.5 22 5 21.5 5 21 V11 H2 L12 2Z" fill="#F0F4F8" />
           <path d="M12 1.5 L23 11.5 L21.5 13 L12 4.5 L2.5 13 L1 11.5 L12 1.5Z" fill="url(#roofGrad)" stroke="#003366" strokeWidth="0.5"/>
           <rect x="10" y="14" width="4" height="8" rx="0.5" fill="url(#doorGrad)" />
           <circle cx="13" cy="18" r="0.5" fill="#5c4002" />
        </g>
      </g>
    ),

    // 3D Graduation Cap (Tenant Mgt)
    GraduationCap: (
      <g>
        <defs>
          <linearGradient id="capTop" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="50%" stopColor="#2d2d2d" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
          <linearGradient id="tasselGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
        <filter id="shadowCap">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.5"/>
        </filter>
        <g filter="url(#shadowCap)">
            <path d="M12 3 L22 8 L12 13 L2 8 Z" fill="url(#capTop)" stroke="#555" strokeWidth="0.5"/>
            <path d="M22 8 V11 C22 13.5 17.5 15.5 12 15.5 C6.5 15.5 2 13.5 2 11 V8" fill="#2d2d2d" opacity="0.9"/>
            <circle cx="12" cy="8" r="1.5" fill="#444" />
            <path d="M12 8 L20 12 V18" stroke="url(#tasselGold)" strokeWidth="1.5" fill="none"/>
            <circle cx="20" cy="18" r="1.5" fill="#DAA520" />
        </g>
      </g>
    ),

    // 3D Calculator (CRM)
    Calculator: (
      <g>
        <rect x="5" y="2" width="14" height="20" rx="2" fill="#263238" stroke="#102027" strokeWidth="0.5" filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.4))" />
        <rect x="7" y="5" width="10" height="4" rx="0.5" fill="#CFD8DC" />
        <circle cx="8" cy="12" r="1.5" fill="#78909C" /> <circle cx="12" cy="12" r="1.5" fill="#78909C" /> <circle cx="16" cy="12" r="1.5" fill="#FF7043" />
        <circle cx="8" cy="15.5" r="1.5" fill="#78909C" /> <circle cx="12" cy="15.5" r="1.5" fill="#78909C" /> <circle cx="16" cy="15.5" r="1.5" fill="#FFB74D" />
        <circle cx="8" cy="19" r="1.5" fill="#78909C" /> <circle cx="12" cy="19" r="1.5" fill="#78909C" /> <circle cx="16" cy="19" r="1.5" fill="#4CAF50" />
      </g>
    ),

    // 3D Briefcase (Tool-Platform)
    Briefcase: (
      <g>
        <defs>
          <linearGradient id="leather" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#795548" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>
          <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="50%" stopColor="#9E9E9E" />
            <stop offset="100%" stopColor="#616161" />
          </linearGradient>
        </defs>
        <path d="M8 2 H16 V6 H8 Z" fill="none" stroke="url(#metal)" strokeWidth="2" />
        <rect x="2" y="6" width="20" height="15" rx="2" fill="url(#leather)" stroke="#3E2723" strokeWidth="0.5" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))" />
        <rect x="2" y="6" width="20" height="5" rx="1" fill="#8D6E63" opacity="0.3" />
        <rect x="5" y="6" width="2" height="4" fill="url(#metal)" />
        <rect x="17" y="6" width="2" height="4" fill="url(#metal)" />
        <rect x="10" y="11" width="4" height="2" rx="0.5" fill="url(#metal)" />
      </g>
    ),

    // 3D Chat Bubbles (Communication)
    ChatBubbleLeftRight: (
      <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
        <path d="M2 10 C2 6 5 3 10 3 H12 C16 3 19 6 19 10 V14 C19 16 17 18 14 18 H6 L2 22 V10" fill="#42A5F5" stroke="#1E88E5" strokeWidth="0.5"/>
        <path d="M22 14 C22 10 19 7 14 7 H12 C8 7 5 10 5 14 V18 C5 20 7 22 10 22 H18 L22 26 V14" fill="#66BB6A" stroke="#43A047" strokeWidth="0.5" transform="translate(1, -1)"/>
      </g>
    ),

    // 3D Sparkles (Concierge AI)
    Sparkles: (
      <g>
        <path d="M12 2 L14 8 L20 10 L14 12 L12 18 L10 12 L4 10 L10 8 Z" fill="#FFEB3B" stroke="#FBC02D" strokeWidth="0.5" filter="drop-shadow(0 0 5px #FFEB3B)"/>
        <path d="M19 16 L20 19 L23 20 L20 21 L19 24 L18 21 L15 20 L18 19 Z" fill="#80DEEA" stroke="#00BCD4" strokeWidth="0.2" filter="drop-shadow(0 0 3px #80DEEA)"/>
        <path d="M5 18 L6 20 L8 21 L6 22 L5 24 L4 22 L2 21 L4 20 Z" fill="#E1BEE7" stroke="#9C27B0" strokeWidth="0.2"/>
      </g>
    ),

    // 3D Heart (Wellness)
    Heart: (
      <g>
        <defs>
          <radialGradient id="heartGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff8a80" />
            <stop offset="100%" stopColor="#d32f2f" />
          </radialGradient>
        </defs>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#heartGrad)" stroke="#b71c1c" strokeWidth="0.5" filter="drop-shadow(0 2px 4px rgba(211,47,47,0.4))"/>
        <path d="M16 6 C15 5 14 5.5 13.5 6.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      </g>
    ),

    // 3D Tools (Wrench/Screwdriver)
    WrenchScrewdriver: (
      <g filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.4))">
        <rect x="11" y="2" width="3" height="18" rx="1" fill="#FF7043" transform="rotate(45 12 12)" />
        <rect x="11" y="2" width="3" height="18" rx="1" fill="#78909C" transform="rotate(-45 12 12)" />
        <circle cx="12" cy="12" r="3" fill="#B0BEC5" stroke="#78909C" />
      </g>
    ),
    
    // 3D Platform Settings (Gear/Tooth)
    Cog6Tooth: (
      <g>
        <defs>
          <linearGradient id="gearSilver" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#ECEFF1" />
             <stop offset="100%" stopColor="#90A4AE" />
          </linearGradient>
        </defs>
        <path d="M12 2 L14 5 L17.5 5.5 L19 8.5 L16.5 11 L17 14 L20 16 L18 19 L15 18 L13 20 L11 20 L9 18 L6 19 L4 16 L7 14 L7.5 11 L5 8.5 L6.5 5.5 L10 5 L12 2Z" fill="url(#gearSilver)" stroke="#546E7A" strokeWidth="0.5" filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"/>
        <circle cx="12" cy="12" r="4" fill="#37474F" />
        <circle cx="12" cy="12" r="2" fill="#78909C" />
      </g>
    ),

    // 3D Overlay Settings (SquaresPlus)
    SquaresPlus: (
      <g filter="drop-shadow(1px 2px 3px rgba(0,0,0,0.3))">
        <rect x="4" y="4" width="8" height="8" rx="2" fill="#7E57C2" stroke="#512DA8" strokeWidth="0.5" />
        <rect x="12" y="12" width="8" height="8" rx="2" fill="#26A69A" stroke="#00796B" strokeWidth="0.5" />
        <path d="M16 4 V8 M14 6 H18" stroke="#FFB74D" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    
    // 3D Hobbies (Palette)
    Hobbies: (
        <g filter="drop-shadow(1px 2px 3px rgba(0,0,0,0.3))">
            <path d="M12 2 C6.48 2 2 6.48 2 12 C2 17.52 6.48 22 12 22 C17.52 22 22 17.52 22 12 C22 6.48 17.52 2 12 2 Z M12 20 C11.45 20 11 19.55 11 19 C11 18.45 11.45 18 12 18 C12.55 18 13 18.45 13 19 C13 19.55 12.55 20 12 20 Z M7.5 15 C6.67 15 6 14.33 6 13.5 C6 12.67 6.67 12 7.5 12 C8.33 12 9 12.67 9 13.5 C9 14.33 8.33 15 7.5 15 Z M9.5 9 C8.67 9 8 8.33 8 7.5 C8 6.67 8.67 6 9.5 6 C10.33 6 11 6.67 11 7.5 C11 8.33 10.33 9 9.5 9 Z M14.5 9 C13.67 9 13 8.33 13 7.5 C13 6.67 13.67 6 14.5 6 C15.33 6 16 6.67 16 7.5 C16 8.33 15.33 9 14.5 9 Z M17.5 14 C16.67 14 16 13.33 16 12.5 C16 11.67 16.67 11 17.5 11 C18.33 11 19 11.67 19 12.5 C19 13.33 18.33 14 17.5 14 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth="0.5"/>
            <circle cx="7.5" cy="13.5" r="1.5" fill="#EF5350" />
            <circle cx="9.5" cy="7.5" r="1.5" fill="#42A5F5" />
            <circle cx="14.5" cy="7.5" r="1.5" fill="#66BB6A" />
        </g>
    ),

    // ==========================================
    // UI ELEMENTS
    // ==========================================

    Search: (
      <g>
        <circle cx="10" cy="10" r="7" stroke="#607D8B" strokeWidth="2" fill="#E0F7FA" opacity="0.6" />
        <rect x="15" y="15" width="8" height="3" rx="1.5" transform="rotate(45 19 16.5)" fill="#F57C00" />
      </g>
    ),
    Bell: (
      <g>
        <path d="M12 3 C8 3 5 6 5 12 L4 16 H20 L19 12 C19 6 16 3 12 3Z" fill="#FBC02D" stroke="#F9A825" strokeWidth="0.5"/>
        <circle cx="12" cy="18" r="2" fill="#F57F17" />
      </g>
    ),
    Envelope: (
      <g>
        <rect x="2" y="4" width="20" height="14" rx="1" fill="#E3F2FD" stroke="#90CAF9" />
        <path d="M2 4 L12 12 L22 4" stroke="#90CAF9" />
      </g>
    ),
    Grid: (
      <g>
        <circle cx="5" cy="5" r="2.5" fill="#3041c7" /> <circle cx="12" cy="5" r="2.5" fill="#3041c7" /> <circle cx="19" cy="5" r="2.5" fill="#3041c7" />
        <circle cx="5" cy="12" r="2.5" fill="#3041c7" /> <circle cx="12" cy="12" r="2.5" fill="#3041c7" /> <circle cx="19" cy="12" r="2.5" fill="#3041c7" />
        <circle cx="5" cy="19" r="2.5" fill="#3041c7" /> <circle cx="12" cy="19" r="2.5" fill="#3041c7" /> <circle cx="19" cy="19" r="2.5" fill="#3041c7" />
      </g>
    ),
    Toggle: (
      <g>
        <rect x="2" y="6" width="20" height="12" rx="6" fill="#e0e0e0" stroke="#bdbdbd" />
        <circle cx="16" cy="12" r="5" fill="#1d2a78" />
      </g>
    ),
    Book: (
      <g>
        <rect x="4" y="2" width="16" height="20" rx="1" fill="#1565C0" />
        <path d="M6 2 V22" stroke="white" opacity="0.3"/>
        <rect x="8" y="6" width="8" height="2" fill="white" opacity="0.8"/>
      </g>
    ),
    X: <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
    Minimize: <path d="M5 12 H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
    ChevronRight: <path d="M9 18 L15 12 L9 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />,
    ChevronLeft: <path d="M15 18 L9 12 L15 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />,
    UserIcon: (
        <g>
            <circle cx="12" cy="8" r="4" fill="#90A4AE" />
            <path d="M4 20 C4 16 7 14 12 14 C17 14 20 16 20 20" fill="#90A4AE" />
        </g>
    ),
    PlusCircle: (
      <g>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7 V17 M7 12 H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    List: (
      <g>
        <path d="M4 6 H20 M4 12 H20 M4 18 H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    EllipsisHorizontal: (
      <g>
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </g>
    ),
    BoltIcon: (
      <path d="M13 2 L3 14 H12 L11 22 L21 10 H12 L13 2 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    ),
    DocumentTextIcon: (
      <g>
         <path d="M6 2 H14 L18 6 V22 H6 Z" stroke="currentColor" strokeWidth="2" />
         <path d="M14 2 V6 H18" stroke="currentColor" strokeWidth="2" />
      </g>
    ),
    PencilIcon: (
        <path d="M14 3 L21 10 L10 21 L3 21 L3 14 L14 3 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    ArrowRightIcon: <path d="M4 12 H20 M14 6 L20 12 L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    CommandLineIcon: (
        <g>
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M6 8 L10 12 L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16 H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
    ),
    RunningIcon: <path d="M5 20 L9 16 L7 12 L11 10 L14 13 L19 12 M13 6 C13 7 12 8 11 8 C10 8 9 7 9 6 C9 5 10 4 11 4 C12 4 13 5 13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    MoonIcon: <path d="M20 12 A8 8 0 1 1 12 4 A6 6 0 0 0 20 12 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />,
    FireIcon: <path d="M12 2C12 2 5 8 5 13C5 17 8 20 12 20C16 20 19 17 19 13C19 8 12 2 12 2ZM12 18C10 18 8 16 8 13C8 11 10 8 12 6C14 8 16 11 16 13C16 16 14 18 12 18Z" fill="currentColor" />,
    AppleIcon: (
      <g>
        <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6 V3 M12 6 L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    ArrowPathIcon: <path d="M4 12 A8 8 0 1 1 12 20 A8 8 0 0 1 12 4 M12 8 V12 L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    TrashIcon: <path d="M3 6 H21 M8 6 V4 H16 V6 M10 11 V17 M14 11 V17 M5 6 L6 20 H18 L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    
    // ==========================================
    // DOCK APPS (3D)
    // ==========================================
    StudioIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#212121" />
        <path d="M7 6 L17 12 L7 18 Z" fill="#ff9100" />
      </g>
    ),
    SettingsIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#607D8B" />
        <circle cx="12" cy="12" r="5" stroke="#CFD8DC" strokeWidth="3" fill="none" />
      </g>
    ),
    MessagingIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#4CAF50" />
        <path d="M12 7 C8 7 5 9 5 12 C5 14 7 16 9 16 V19 L12 16 H13 C17 16 20 14 20 12" fill="white" />
      </g>
    ),
    MediaIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#E91E63" />
        <path d="M9 8 L16 12 L9 16 V8" fill="white" />
      </g>
    ),
    ActivitiesIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF9800" />
        <path d="M6 14 L10 8 L14 12 L18 6" stroke="white" strokeWidth="2" fill="none"/>
      </g>
    ),
    ReligionIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#795548" />
        <path d="M12 5 V19 M7 10 H17" stroke="#D7CCC8" strokeWidth="2" />
      </g>
    ),
    IslamIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#00695C" />
        {/* Crescent Moon */}
        <path d="M15 12 A 5 5 0 1 1 10 7 A 4 4 0 1 0 15 12 Z" fill="white" />
        {/* Star */}
        <polygon points="16.5,6 17,7.5 18.5,7.5 17.25,8.5 17.75,10 16.5,9 15.25,10 15.75,8.5 14.5,7.5 16,7.5" fill="white" />
      </g>
    ),
    SportIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#2E7D32" />
        <circle cx="12" cy="12" r="6" fill="white" opacity="0.2"/>
        <path d="M12 6 A6 6 0 0 1 12 18" stroke="white" fill="none"/>
      </g>
    ),
    HelpIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#3F51B5" />
        <text x="12" y="17" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">?</text>
      </g>
    ),
    EventsIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#9C27B0" />
        <rect x="6" y="7" width="12" height="11" fill="white" rx="1"/>
      </g>
    ),
    MarketIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#009688" />
        <path d="M7 10 L12 18 L17 10 H7 Z" fill="white" />
      </g>
    ),
    ServicesIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#673AB7" />
        <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none"/>
      </g>
    ),
    GamificationIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#2196F3" />
        <path d="M12 5 L14 9 H18 L15 12 L16 16 L12 14 L8 16 L9 12 L6 9 H10 Z" fill="#FFEB3B" />
      </g>
    ),
    TransportIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#03A9F4" />
        <path d="M5 14 L19 14 L17 8 H7 L5 14" fill="white" />
      </g>
    ),
    WellnessIcon3D: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#F44336" />
        <path d="M12 18 L10.5 16.5 C5 11.5 4 10 4 7.5 C4 5.5 5.5 4 7.5 4 C9 4 10.5 5 12 6.5 C13.5 5 15 4 16.5 4 C18.5 4 20 5.5 20 7.5 C20 10 16 11.5 13.5 16.5 L12 18 Z" fill="white" />
      </g>
    ),

    CurrencyDollarIcon: <path d="M12 2 V22 M17 5 H9.5 C8.5 5 7.5 5.5 7.5 7 C7.5 9 9 10 10.5 10.5 L13.5 11.5 C15 12 16.5 13 16.5 15 C16.5 16.5 15.5 17 14.5 17 H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    UserGroup: (
      <g>
        <path d="M17 21 V19 C17 16.79 15.21 15 13 15 H5 C2.79 15 1 16.79 1 19 V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21 V19 C22.99 17.52 22.22 16.18 21 15.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13 C17.22 3.95 18 5.38 18 7 C18 8.62 17.22 10.05 16 10.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    
    // Generic Fallbacks for App Subnav
    PaperAirplane: <path d="M3 21 L21 12 L3 3 V10 L14 12 L3 14 V21 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    PlayIcon: <path d="M8 5 V19 L19 12 L8 5 Z" fill="currentColor" />,
    TvIcon: <path d="M21 6H3C1.9 6 1 6.9 1 8V16C1 17.1 1.9 18 3 18H8L6 22H18L16 18H21C22.1 18 23 17.1 23 16V8C23 6.9 22.1 6 21 6ZM21 16H3V8H21V16Z" fill="currentColor" />,
    PauseIcon: <path d="M8 5 H10 V19 H8 Z M14 5 H16 V19 H14 Z" fill="currentColor" />,
    HandThumbUpIcon: <path d="M7 11 V19 M7 13 H3 L5 5 H13 L11 9 H18 L16 19 H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    CalendarIcon: <path d="M4 6 H20 M4 10 H20 M4 6 V20 H20 V6 M8 4 V8 M16 4 V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    MapPinIcon: <path d="M12 2 C8 2 5 5 5 9 C5 15 12 22 12 22 C12 22 19 15 19 9 C19 5 16 2 12 2 Z M12 10 A3 3 0 1 1 12 4 A3 3 0 0 1 12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    TruckIcon: <path d="M3 10 H15 L18 14 H21 V18 H3 V10 M15 18 A2 2 0 1 1 15 14 A2 2 0 0 1 15 18 M7 18 A2 2 0 1 1 7 14 A2 2 0 0 1 7 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    ShareIcon: <path d="M15 8 L18 5 L21 8 M18 5 V15 M5 12 V19 H19 V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    CheckCircleIcon: <path d="M9 12 L11 14 L15 10 M21 12 A9 9 0 1 1 12 3 A9 9 0 0 1 21 12 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    TicketIcon: <path d="M4 8 L20 8 M4 16 L20 16 M4 6 H20 V18 H4 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    TrophyIcon: <path d="M8 4 H16 M8 4 V10 C8 12 10 14 12 14 C14 14 16 12 16 10 V4 M12 14 V18 M8 20 H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    StarIcon: <path d="M12 2 L15 9 H22 L17 13 L19 21 L12 17 L5 21 L7 13 L2 9 H9 L12 2 Z" fill="currentColor" stroke="none" />,
    BookOpenIcon: <path d="M4 6 C4 6 6 4 12 4 C18 4 20 6 20 6 V20 C20 20 18 18 12 18 C6 18 4 20 4 20 V6 Z M12 4 V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />,
    
    // File Management Icons
    Folder: <path d="M3 7 V19 H21 V9 H13 L11 7 H3 Z" fill="currentColor" />,
    FolderOpen: <path d="M3 7 V19 H21 V9 H13 L11 7 H3 Z M21 11 L19 19 H5 L3 11 H21 Z" fill="currentColor" />,
    ArrowUpTrayIcon: <path d="M12 15 V3 M12 3 L8 7 M12 3 L16 7 M4 17 V19 H20 V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ArrowDownTrayIcon: <path d="M12 3 V15 M12 15 L8 11 M12 15 L16 11 M4 17 V19 H20 V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    FolderPlusIcon: <path d="M3 7 V19 H21 V9 H13 L11 7 H3 Z M12 11 V17 M9 14 H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    CheckIcon: <path d="M5 13 L9 17 L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    XMarkIcon: <path d="M6 18 L18 6 M6 6 L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ExclamationCircleIcon: <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    
    // Communication Icons
    ArrowLeftIcon: <path d="M10 19 L3 12 L10 5 M3 12 H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ArchiveBoxIcon: <path d="M20 8 V21 H4 V8 M2 3 H22 V8 H2 V3 Z M10 12 H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    ArrowUturnLeftIcon: <path d="M9 15 L3 9 M3 9 L9 3 M3 9 H15 C19 9 22 12 22 16 C22 20 19 23 15 23 H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    PaperClipIcon: <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    PhotoIcon: <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    
    // Theme Icons
    SunIcon: <path d="M12 3V4M12 20V21M4 12H3M21 12H20M5.636 5.636L6.343 6.343M17.657 17.657L18.364 18.364M5.636 18.364L6.343 17.657M17.657 6.343L18.364 5.636M12 8A4 4 0 1012 16A4 4 0 0012 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ComputerDesktopIcon: <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    
    // Aliases & New Icons for ProjectsApp
    FolderOpenIcon: <path d="M3 7 V19 H21 V9 H13 L11 7 H3 Z M21 11 L19 19 H5 L3 11 H21 Z" fill="currentColor" />,
    FolderIcon: <path d="M3 7 V19 H21 V9 H13 L11 7 H3 Z" fill="currentColor" />,
    Cog6ToothIcon: (
      <g>
        <path d="M12 2 L14 5 L17.5 5.5 L19 8.5 L16.5 11 L17 14 L20 16 L18 19 L15 18 L13 20 L11 20 L9 18 L6 19 L4 16 L7 14 L7.5 11 L5 8.5 L6.5 5.5 L10 5 L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="12" cy="12" r="3" fill="white" />
      </g>
    ),
    EllipsisHorizontalIcon: (
      <g>
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </g>
    ),
    CloudArrowUpIcon: <path d="M12 16 V9 M12 9 L9 12 M12 9 L15 12 M5 16 V17 C5 19.2 6.8 21 9 21 H15 C17.2 21 19 19.2 19 17 V16 M16 16 C19 16 21 14 21 11 C21 8 19 6 16 6 C16 3 13 2 10 3 C7 4 6 7 6 7 C3 7 2 9 2 12 C2 14 4 16 6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    FunnelIcon: <path d="M3 4 H21 L14 12 V18 L10 20 V12 L3 4 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    VideoCameraIcon: <path d="M15 10 L20 6 V18 L15 14 V10 Z M4 8 H15 V16 H4 V8 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    SpeakerWaveIcon: <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    
    // ==========================================
    // NEW ICONS (Standardized)
    // ==========================================
    GlobeAltIcon: <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    CpuChipIcon: <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ShieldCheckIcon: <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    AcademicCapIcon: <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.258 50.55 50.55 0 00-2.658.813m-15.482 0A50.923 50.923 0 0112 13.489a50.92 50.92 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    UsersIcon: <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    XCircleIcon: <path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    CogIcon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    HomeIcon: <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    BellIcon: <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    SearchIcon: <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    MagnifyingGlassIcon: <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    MenuIcon: <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ChevronDownIcon: <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ChevronUpIcon: <path d="M4.5 15.75l7.5-7.5 7.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    PlusIcon: <path d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    MinusIcon: <path d="M19.5 12h-15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    InformationCircleIcon: <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    QuestionMarkCircleIcon: <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ArrowRightOnRectangleIcon: <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ArrowLeftOnRectangleIcon: <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    EyeIcon: <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    EyeSlashIcon: <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    LockClosedIcon: <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    LockOpenIcon: <path d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    UserPlusIcon: <path d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    UserMinusIcon: <path d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    GiftIcon: <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M3 11.25h18M3 11.25c0-1.656 1.344-3 3-3h1.5m13.5 3c0-1.656-1.344-3-3-3h-1.5m-1.5 0l-3-3m0 0l-3 3m3-3v11.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ChartBarIcon: <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ChartPieIcon: <path d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ChartPieIconFilled: <path d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" fill="currentColor" stroke="none" />,
    ShieldExclamationIcon: <path d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0112 2.714zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    StopIcon: <path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    StopCircleIcon: <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    
    // Additional Standard Icons
    BriefcaseIcon: <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    PresentationChartLineIcon: <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    PlusCircleIcon: (
      <g>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 7 V17 M7 12 H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    UserGroupIcon: (
      <g>
        <path d="M17 21 V19 C17 16.79 15.21 15 13 15 H5 C2.79 15 1 16.79 1 19 V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21 V19 C22.99 17.52 22.22 16.18 21 15.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13 C17.22 3.95 18 5.38 18 7 C18 8.62 17.22 10.05 16 10.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    WrenchScrewdriverIcon: <path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    GraduationCapIcon: <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.258 50.55 50.55 0 00-2.658.813m-15.482 0A50.923 50.923 0 0112 13.489a50.92 50.92 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    
    // Quantum Quiz Icons
    Brain: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M3.343 15.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    "help-circle": <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    check: <path d="M4.5 12.75l6 6 9-13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    "arrow-right": <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    info: <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    award: <path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75a1.125 1.125 0 01-1.125-1.125v-3.375m9-6.75h.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-.75m-9-3.75h-.75a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h.75m-.75-3.75h.008v.008h-.008v-.008zm6.75 0h.008v.008h-.008v-.008z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    ClockIcon: <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    
  };
  
  // Smart mapping for generic icons requested in config
  const smartIconName = icons[name] ? name : 'Grid'; // Default to Grid if not found

  return (
    <svg 
      className={sizeClass} 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      fill="none" 
    >
      {icons[smartIconName]}
    </svg>
  );
};
