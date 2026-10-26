{
  "brand": {
    "name": "KimmberlyyITAVIP",
    "language": "it-IT",
    "positioning": [
      "Luxury creator club (18+) non-esplicito",
      "Cinematico, premium, fluido",
      "Mobile-first, conversion-first"
    ],
    "tone_of_voice": {
      "keywords": ["sensuale", "elegante", "riservato", "esclusivo", "diretto"],
      "copy_rules": [
        "Frasi brevi, ritmo da trailer.",
        "Evita slang eccessivo; usa italiano pulito.",
        "CTA sempre orientate all’azione: ‘Sblocca’, ‘Entra’, ‘Richiedi’, ‘Scrivimi’."
      ]
    }
  },

  "visual_personality": {
    "style_fusion": [
      "Cinematic dark intro + glow reveal (stile terpstar.eu)",
      "Editorial luxury typography (Playfair Display) + UI grotesk moderna (Space Grotesk)",
      "Card layout premium con bordi sottili oro + blush come luce morbida",
      "Micro-particelle sparkle e scroll reveal controllati (mai invadenti)"
    ],
    "layout_principles": [
      "Z-pattern in hero (logo/tagline/CTA) + F-pattern nelle sezioni testo.",
      "Sezioni con: micro-label uppercase + dot luminoso + headline grande uppercase.",
      "Molto respiro: padding verticali ampi, cards non troppo dense.",
      "Niente centrature globali: testo allineato a sinistra, CTA raggruppate."
    ]
  },

  "design_tokens": {
    "css_custom_properties": {
      "notes": [
        "Aggiornare /app/frontend/src/index.css in :root e .dark con questi token (HSL consigliato per shadcn).",
        "Impostare tema di default in dark (aggiungere class 'dark' su html/body o root app).",
        "Non usare gradienti scuri saturi; gradienti solo come overlay decorativo in hero (<=20% viewport)."
      ],
      "palette_hex": {
        "black_ink": "#0B0B0D",
        "black_velvet": "#111114",
        "surface_1": "#141418",
        "surface_2": "#1A1A20",
        "text_primary": "#F5F2EE",
        "text_muted": "#B9B2AA",
        "gold": "#D6B25E",
        "gold_deep": "#B8923B",
        "blush": "#F2D7D0",
        "rose_gold": "#B77A86",
        "border_subtle": "rgba(214,178,94,0.18)",
        "shadow": "rgba(0,0,0,0.55)",
        "focus_ring": "rgba(214,178,94,0.45)"
      },
      "shadcn_hsl_suggestion": {
        "background": "240 10% 4%",
        "foreground": "30 20% 96%",
        "card": "240 10% 7%",
        "card-foreground": "30 20% 96%",
        "popover": "240 10% 7%",
        "popover-foreground": "30 20% 96%",
        "primary": "42 55% 60%",
        "primary-foreground": "240 10% 6%",
        "secondary": "240 8% 12%",
        "secondary-foreground": "30 20% 96%",
        "muted": "240 8% 12%",
        "muted-foreground": "30 10% 72%",
        "accent": "350 35% 88%",
        "accent-foreground": "240 10% 6%",
        "destructive": "0 70% 45%",
        "destructive-foreground": "0 0% 98%",
        "border": "42 35% 22%",
        "input": "240 8% 14%",
        "ring": "42 55% 60%",
        "radius": "0.9rem"
      },
      "gradients_allowed": {
        "hero_overlay_only": [
          "radial-gradient(60% 60% at 70% 20%, rgba(214,178,94,0.18) 0%, rgba(214,178,94,0) 60%)",
          "radial-gradient(50% 50% at 20% 10%, rgba(242,215,208,0.14) 0%, rgba(242,215,208,0) 62%)"
        ],
        "rule": "Somma overlay gradienti <= 20% viewport; mai su aree testo lunghe; mai su elementi <100px."
      },
      "spacing_scale_px": {
        "xs": 8,
        "sm": 12,
        "md": 16,
        "lg": 24,
        "xl": 32,
        "2xl": 48,
        "3xl": 72,
        "4xl": 96
      },
      "shadow_system": {
        "elev_1": "0 10px 30px rgba(0,0,0,0.35)",
        "elev_2": "0 18px 60px rgba(0,0,0,0.55)",
        "glow_gold": "0 0 0 1px rgba(214,178,94,0.18), 0 0 28px rgba(214,178,94,0.10)",
        "glow_blush": "0 0 0 1px rgba(242,215,208,0.14), 0 0 26px rgba(242,215,208,0.10)"
      },
      "radius_system": {
        "card": "20px",
        "button": "12px",
        "pill": "999px",
        "input": "14px"
      }
    }
  },

  "typography": {
    "google_fonts": {
      "heading": {
        "family": "Playfair Display",
        "weights": [600, 700],
        "usage": "Hero logo lockup, H1/H2 editorial"
      },
      "body_ui": {
        "family": "Space Grotesk",
        "weights": [400, 500, 600],
        "usage": "UI, labels, body, buttons"
      }
    },
    "tailwind_text_hierarchy": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em]",
      "h2": "text-base md:text-lg text-muted-foreground",
      "section_label": "text-xs tracking-[0.22em] uppercase text-muted-foreground",
      "section_headline": "text-3xl sm:text-4xl font-semibold uppercase tracking-[0.06em]",
      "body": "text-sm sm:text-base leading-relaxed text-foreground/90",
      "small": "text-xs text-muted-foreground"
    },
    "type_details": [
      "Headlines spesso uppercase ma con tracking ampio per lusso.",
      "Numeri prezzi: Space Grotesk 600, tabular-nums (class: tabular-nums).",
      "Evita testo troppo sottile su sfondo scuro: minimo font-medium per label importanti."
    ]
  },

  "grid_and_layout": {
    "container": {
      "max_width": "max-w-6xl",
      "padding": "px-4 sm:px-6 lg:px-8",
      "section_spacing": "py-16 sm:py-20 lg:py-24"
    },
    "hero": {
      "structure": [
        "Full-screen (min-h-[100svh])",
        "Background: foto utente in cover + overlay scuro + 2 radial glow (oro/blush)",
        "Left aligned content block (max-w-xl) + CTA row",
        "Scroll hint in basso (pill con ‘Scorri’)"
      ],
      "parallax": {
        "approach": "Framer Motion useScroll + useTransform per muovere background image e glow overlay (leggero).",
        "limits": "Parallax max 24px su mobile, 48px su desktop."
      }
    },
    "section_pattern": {
      "pattern": "Dot luminoso + label uppercase + headline grande + testo + CTA",
      "dot": "w-2 h-2 rounded-full bg-[--gold] shadow-[var(--glow_gold)]"
    },
    "cards": {
      "style": "Card scure arrotondate, bordo oro sottilissimo, highlight on hover",
      "tailwind": "rounded-[20px] bg-card/70 backdrop-blur-[6px] border border-[color:var(--border_subtle)] shadow-[var(--elev_1)]"
    }
  },

  "motion_and_microinteractions": {
    "libraries": {
      "framer_motion": {
        "use": "Intro reveal, scroll reveal, hover micro-animations, parallax",
        "install": "npm i framer-motion"
      },
      "lenis_optional": {
        "use": "Smooth scroll premium (solo landing, non admin)",
        "install": "npm i @studio-freight/lenis"
      },
      "particles": {
        "use": "Sparkle particles leggeri (solo hero/intro)",
        "suggestion": "tsparticles (react) oppure canvas custom minimal",
        "install": "npm i react-tsparticles tsparticles"
      }
    },
    "principles": [
      "Animazioni lente e deliberate (luxury): duration 0.6–1.0s, ease [0.22,1,0.36,1].",
      "Hover: micro lift (translateY -2px) + glow oro/blush.",
      "Scroll reveal: opacity 0→1 + y 14→0; stagger 0.08.",
      "Riduci/Disattiva se prefers-reduced-motion: reduce."
    ],
    "no_transition_all": "Vietato transition: all. Usare transition-colors, transition-opacity, transition-shadow."
  },

  "page_flow": {
    "routes": {
      "landing": "/",
      "admin_login": "/admin",
      "admin_dashboard": "/admin/requests"
    },
    "landing_sections_order": [
      "Intro cinematica + Salta l’intro",
      "Age gate 18+ (Entra / Esci)",
      "Hero parallax (logo, tagline, 2 CTA)",
      "Il mio mondo (about)",
      "Anteprima contenuti esclusivi (locked/blur)",
      "Bundle & Prezzi (tiers)",
      "Cataloghi filtrabili (pills)",
      "Richiesta personalizzata (form salvato DB)",
      "FAQ",
      "Community / Contatti (Telegram/Instagram/WhatsApp)",
      "Footer + disclaimer 18+"
    ]
  },

  "components": {
    "component_path": {
      "shadcn_primary": [
        "/app/frontend/src/components/ui/button.jsx",
        "/app/frontend/src/components/ui/card.jsx",
        "/app/frontend/src/components/ui/badge.jsx",
        "/app/frontend/src/components/ui/tabs.jsx",
        "/app/frontend/src/components/ui/toggle-group.jsx",
        "/app/frontend/src/components/ui/accordion.jsx",
        "/app/frontend/src/components/ui/dialog.jsx",
        "/app/frontend/src/components/ui/sheet.jsx",
        "/app/frontend/src/components/ui/input.jsx",
        "/app/frontend/src/components/ui/textarea.jsx",
        "/app/frontend/src/components/ui/label.jsx",
        "/app/frontend/src/components/ui/separator.jsx",
        "/app/frontend/src/components/ui/scroll-area.jsx",
        "/app/frontend/src/components/ui/sonner.jsx",
        "/app/frontend/src/components/ui/table.jsx"
      ],
      "custom_components_to_create": [
        "/app/frontend/src/components/IntroGate.js",
        "/app/frontend/src/components/AgeGateDialog.js",
        "/app/frontend/src/components/ParallaxHero.js",
        "/app/frontend/src/components/SectionHeader.js",
        "/app/frontend/src/components/LockedPreviewGrid.js",
        "/app/frontend/src/components/PricingTiers.js",
        "/app/frontend/src/components/CatalogFilters.js",
        "/app/frontend/src/components/CustomRequestForm.js",
        "/app/frontend/src/components/SocialContactBar.js",
        "/app/frontend/src/components/FooterLuxury.js",
        "/app/frontend/src/components/admin/AdminLogin.js",
        "/app/frontend/src/components/admin/RequestsTable.js"
      ]
    },

    "component_specs": {
      "intro_gate": {
        "goal": "Impatto cinematografico + controllo utente (Salta l’intro) + performance",
        "ui": [
          "Full-screen overlay con video (muted) o fallback immagine",
          "Logo reveal (mask/opacity) + tagline",
          "Button ‘Salta l’intro’ sempre visibile (top-right)"
        ],
        "a11y": [
          "Focus trap se overlay attivo",
          "Esc = salta",
          "prefers-reduced-motion: salta automaticamente"
        ],
        "data_testids": {
          "skip": "intro-skip-button",
          "enter": "intro-enter-button"
        }
      },

      "age_gate": {
        "ui": "Dialog shadcn con backdrop scuro + blur leggero; copy chiaro 18+",
        "buttons": ["Entra", "Esci"],
        "storage": "Persistenza in localStorage: age_verified=1",
        "data_testids": {
          "dialog": "age-gate-dialog",
          "enter": "age-gate-enter-button",
          "exit": "age-gate-exit-button"
        }
      },

      "hero": {
        "ctas": [
          "CTA primaria: ‘Sblocca i contenuti’",
          "CTA secondaria: ‘Richiesta personalizzata’"
        ],
        "scroll_hint": "Pill in basso con micro-animazione (yoyo 6px) e testo ‘Scorri’",
        "data_testids": {
          "primary": "hero-primary-cta",
          "secondary": "hero-secondary-cta"
        }
      },

      "locked_preview": {
        "ui": [
          "Grid 2 colonne mobile / 3 desktop",
          "Cards con immagine blur + overlay ‘Bloccato’ + badge ‘VIP’",
          "Tap apre Dialog con teaser + CTA contatto"
        ],
        "blur": "Usare CSS filter blur(10px) + overlay gradient leggero; non mostrare dettagli.",
        "data_testids": {
          "item": "locked-preview-item",
          "open": "locked-preview-open-dialog"
        }
      },

      "pricing": {
        "ui": [
          "3 tier cards (Base / VIP / Elite) con badge",
          "Una card ‘Consigliato’ con glow oro",
          "Lista benefit con icone lucide-react"
        ],
        "data_testids": {
          "tier": "pricing-tier-card",
          "cta": "pricing-tier-cta-button"
        }
      },

      "catalog_filters": {
        "ui": [
          "ToggleGroup pills (Foto / Video / Bundle / Novità)",
          "Risultati in cards con badge",
          "Empty state elegante (testo + CTA contatto)"
        ],
        "data_testids": {
          "filter": "catalog-filter-pill",
          "grid": "catalog-results-grid"
        }
      },

      "custom_request_form": {
        "fields": [
          "Nome (opzionale)",
          "Canale preferito (Select: Telegram/Instagram/WhatsApp)",
          "Budget indicativo (Select)",
          "Descrizione richiesta (Textarea)",
          "Consenso 18+ (Checkbox)"
        ],
        "submit": "Invia richiesta",
        "toast": "Usare sonner per conferma/errore",
        "data_testids": {
          "form": "custom-request-form",
          "submit": "custom-request-submit-button",
          "channel": "custom-request-channel-select",
          "message": "custom-request-message-textarea"
        }
      },

      "faq": {
        "ui": "Accordion shadcn, 6-8 domande, tono rassicurante",
        "data_testids": {
          "accordion": "faq-accordion"
        }
      },

      "social_contact": {
        "ui": "Bar con 3 bottoni (Telegram/Instagram/WhatsApp) stile ghost + bordo oro",
        "placeholders": "Link placeholder fino a domani",
        "data_testids": {
          "telegram": "contact-telegram-button",
          "instagram": "contact-instagram-button",
          "whatsapp": "contact-whatsapp-button"
        }
      },

      "admin": {
        "login": {
          "ui": "Card centrale ma contenuto allineato a sinistra; input password + submit",
          "data_testids": {
            "password": "admin-password-input",
            "submit": "admin-login-submit-button"
          }
        },
        "requests_table": {
          "ui": "Table shadcn con status badge + drawer per dettagli/notes",
          "columns": ["Data", "Nome", "Canale", "Budget", "Stato", "Azioni"],
          "data_testids": {
            "table": "admin-requests-table",
            "row": "admin-requests-row",
            "status": "admin-request-status-select",
            "notes": "admin-request-notes-textarea"
          }
        }
      }
    }
  },

  "images": {
    "image_urls": [
      {
        "category": "hero_background",
        "description": "Hero parallax background (cover). Usare overlay scuro + glow oro/blush.",
        "url": "https://customer-assets-0z36b82j.emergentagent.net/job_588f2616-bd6e-4bf9-a505-f17b9acdd6d9/artifacts/c015e1711039f903_IMG_1482.jpeg"
      },
      {
        "category": "about_section",
        "description": "Foto per ‘Il mio mondo’ (aspect ratio 4:5 o 3:4 con crop).",
        "url": "https://customer-assets-0z36b82j.emergentagent.net/job_588f2616-bd6e-4bf9-a505-f17b9acdd6d9/artifacts/9d00e0c5dea96c11_E80AE596-C117-47A8-9A51-A1771FD0608D.jpeg"
      },
      {
        "category": "locked_preview_items",
        "description": "Anteprime contenuti (blur + lock overlay).",
        "url": "https://customer-assets-0z36b82j.emergentagent.net/job_588f2616-bd6e-4bf9-a505-f17b9acdd6d9/artifacts/3591dfa3c51b258a_IMG_2638.webp"
      }
    ],
    "usage_rules": [
      "Usare SOLO queste foto (nessuna stock people).",
      "Mai mostrare contenuti espliciti: mantenere blur/overlay nelle anteprime.",
      "Ottimizzare: usare <img loading='lazy'> e dimensioni responsive (srcSet se possibile)."
    ]
  },

  "accessibility": {
    "requirements": [
      "Contrasto: testo principale #F5F2EE su #0B0B0D; evitare oro per body text lungo.",
      "Focus visibile: ring oro (ring-2 ring-[color:var(--focus_ring)] ring-offset-2 ring-offset-background).",
      "Riduzione motion: se prefers-reduced-motion, disattivare parallax/particles e saltare intro.",
      "Tasti: Esc chiude dialog/intro; Tab order logico."
    ]
  },

  "performance": {
    "rules": [
      "Particles solo in hero/intro e sospesi quando non visibili.",
      "Intro video: preload='none' e fallback immagine; non bloccare LCP.",
      "Usare IntersectionObserver per reveal invece di listener scroll pesanti.",
      "Evitare blur pesanti su grandi aree; blur solo su cards/overlay piccoli."
    ]
  },

  "instructions_to_main_agent": {
    "implementation_notes": [
      "Aggiornare tokens in index.css (tema dark) e rimuovere/ignorare stili legacy in App.css (evitare layout centrato).",
      "Implementare IntroGate + AgeGate: gating state machine (introSeen, ageVerified).",
      "Hero: usare foto #1 come background; overlay scuro + 2 radial glow (oro/blush).",
      "Sezioni: usare SectionHeader riutilizzabile (dot + label + headline).",
      "Cataloghi: ToggleGroup pills + grid cards; includere empty state.",
      "Form richieste: salvare su MongoDB via FastAPI; toast sonner; validazione minima.",
      "Admin: password semplice (per ora) + pagina gestione richieste con Table + Drawer/Dialog per note.",
      "TUTTI gli elementi interattivi e info chiave devono avere data-testid (kebab-case).",
      "JS only: creare componenti in .js/.jsx (non .tsx)."
    ],
    "suggested_testids_global": [
      "nav-open-menu-button",
      "nav-contact-cta-button",
      "footer-18plus-disclaimer",
      "catalog-empty-state",
      "toast-success-message"
    ]
  },

  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
