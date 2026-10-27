{
  "title": "V2 — Palette azzurra + Home conversion-first",
  "brand_attributes": [
    "diretto",
    "esplicito",
    "rapido",
    "reale",
    "mobile-first",
    "conversion-first"
  ],
  "design_personality": {
    "north_star": "Mostra subito (pixelato), prezzo chiaro, acquisto in 2–3 tap.",
    "visual_style": [
      "dark editorial (sfondo ink)",
      "accenti OnlyFans blue + blush/rose",
      "card premium ma non 'lussuoso lento'",
      "micro-motion breve (120–220ms)"
    ],
    "anti_goals": [
      "niente sezioni narrative lunghe",
      "niente layout centrati tipo brochure",
      "niente gradienti scuri saturi",
      "niente effetti pesanti (backdrop-blur su mobile)"
    ]
  },
  "typography": {
    "fonts": {
      "display": {
        "family": "Playfair Display",
        "usage": "logo/hero headline, titoli piani",
        "classes": "font-display"
      },
      "body": {
        "family": "Space Grotesk",
        "usage": "UI, prezzi, label, microcopy"
      },
      "mono": {
        "family": "Roboto Mono (fallback: ui-monospace)",
        "usage": "codice ordine, indirizzi wallet, importi",
        "note": "Usare tabular-nums dove possibile"
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "small": "text-xs"
    },
    "rules": [
      "Su sfondo scuro evitare pesi < 400 per testi piccoli.",
      "Prezzi sempre con tracking-tight e tabular-nums (se disponibile)."
    ]
  },
  "color_system": {
    "notes": [
      "Obiettivo: sostituire i valori oro -> azzurro SENZA rinominare le classi esistenti (.btn-gold, .text-gold-sheen, --gold...).",
      "Shadcn tokens (--primary/--ring/--border) devono seguire l'azzurro.",
      "Testo su bottoni azzurri: usare #0b0b0d (ink) per contrasto e look 'reale'."
    ],
    "tokens_css": {
      "path": "/app/frontend/src/index.css",
      "replace_mapping": {
        "--primary": "196 100% 47%",
        "--primary-foreground": "240 10% 4%",
        "--ring": "196 100% 47%",
        "--border": "196 35% 22%",
        "--gold": "#00AFF0",
        "--gold-deep": "#0089BD",
        "--gold-light": "#6AD7FF",
        "--border-subtle": "rgba(0, 175, 240, 0.18)",
        "--glow-gold": "0 0 0 1px rgba(0, 175, 240, 0.22), 0 0 32px rgba(0, 175, 240, 0.14)",
        "--glow-blush": "0 0 0 1px rgba(242, 215, 208, 0.16), 0 0 30px rgba(231, 184, 200, 0.14)",
        "--blush": "#f2d7d0",
        "--rose": "#e7b8c8",
        "--rose-gold": "#b77a86",
        "--ink": "#0b0b0d",
        "--velvet": "#111114",
        "--surface-1": "#141418",
        "--surface-2": "#1a1a20"
      },
      "logo_sheen_gradient": {
        "class": ".text-gold-sheen",
        "new_gradient": "linear-gradient(100deg, #0089BD 0%, #6AD7FF 26%, #00AFF0 44%, #f2d7d0 62%, #00AFF0 80%, #0089BD 100%)",
        "rule": "Logo only; non usare su testi lunghi"
      },
      "button_gradient": {
        "class": ".btn-gold",
        "new_gradient": "linear-gradient(135deg, #6AD7FF 0%, #00AFF0 46%, #0089BD 100%)",
        "text_color": "#0b0b0d"
      },
      "dot_glow": {
        "class": ".dot-glow",
        "background": "var(--gold)",
        "shadow": "0 0 0 4px rgba(0, 175, 240, 0.12), 0 0 18px rgba(0, 175, 240, 0.7)"
      }
    },
    "semantic": {
      "bg": "#0b0b0d",
      "surface_1": "#141418",
      "surface_2": "#1a1a20",
      "text_primary": "#f5f2ee",
      "text_muted": "rgba(245, 242, 238, 0.72)",
      "primary": "#00AFF0",
      "primary_deep": "#0089BD",
      "primary_light": "#6AD7FF",
      "accent_blush": "#f2d7d0",
      "accent_rose": "#e7b8c8",
      "success": "#2EE59D",
      "warning": "#FFCC66",
      "danger": "#FF4D4D"
    }
  },
  "layout_and_grid": {
    "container": {
      "mobile": "px-4",
      "desktop_max": "max-w-[1100px] mx-auto px-6",
      "rule": "Home: full-bleed per griglia foto; contenuti (piani) dentro container"
    },
    "home_above_fold": {
      "structure": [
        "Top mini-bar: logo + counter online + CTA 'Sblocca'",
        "Griglia foto pixelate full-width (dominante)",
        "Scroll hint minimale"
      ],
      "spacing": "Usare 2–3x più spazio: gap-4/5, section py-10 md:py-14"
    },
    "mobile_bottom_nav": {
      "pattern": "fixed bottom bar con 4–5 azioni",
      "height": "h-16",
      "safe_area": "pb-[calc(env(safe-area-inset-bottom)+1rem)]",
      "active_state": "underline/indicator azzurro + label rosa"
    }
  },
  "home_previews": {
    "toggle": {
      "ui": "Switch shadcn + segmented Tabs",
      "component_path": [
        "/app/frontend/src/components/ui/switch.jsx",
        "/app/frontend/src/components/ui/tabs.jsx"
      ],
      "query_param": "?home=a | ?home=b",
      "data_testid": "home-preview-toggle"
    },
    "preview_a": {
      "sections": [
        "Hero minimale",
        "Foto pixelate",
        "Piani & Pacchetti",
        "CTA richiesta",
        "Footer minimo"
      ],
      "rest_in_separate_pages": [
        "/come-funziona",
        "/chi-sono",
        "/regole",
        "/domande",
        "/contatti"
      ]
    },
    "preview_b": {
      "sections": [
        "Hero minimale",
        "Foto pixelate",
        "Piani & Pacchetti",
        "Sezioni compatte in fondo (Accordion/righe)"
      ],
      "compact_sections": [
        "Come funziona (3 righe)",
        "Regole (bullet)",
        "FAQ (Accordion)",
        "Contatti (1 riga + link)"
      ]
    }
  },
  "key_components": {
    "shadcn_primary": {
      "button": {
        "path": "/app/frontend/src/components/ui/button.jsx",
        "variants": [
          "primary (usa .btn-gold rimappato ad azzurro)",
          "secondary (btn-ghost-lux)",
          "destructive"
        ],
        "sizes": "min-h-[44px] px-4 py-3",
        "data_testid_examples": [
          "unlock-primary-button",
          "buy-plan-button",
          "checkout-confirm-button"
        ]
      },
      "badge": {
        "path": "/app/frontend/src/components/ui/badge.jsx",
        "usage": [
          "18+",
          "Sblocca",
          "Conferma automatica",
          "Senza commissioni",
          "Tempo limitato"
        ]
      },
      "card": {
        "path": "/app/frontend/src/components/ui/card.jsx",
        "usage": "Piani, pacchetti, vault items, top fan"
      },
      "tabs": {
        "path": "/app/frontend/src/components/ui/tabs.jsx",
        "usage": "Filtri catalogo: Abbonamenti / One-shot / Extra / Bundle"
      },
      "accordion": {
        "path": "/app/frontend/src/components/ui/accordion.jsx",
        "usage": "FAQ e sezioni compatte preview B"
      },
      "dialog_drawer": {
        "paths": [
          "/app/frontend/src/components/ui/dialog.jsx",
          "/app/frontend/src/components/ui/drawer.jsx"
        ],
        "rule": "Mobile: Drawer per acquisto rapido; Desktop: Dialog"
      },
      "progress": {
        "path": "/app/frontend/src/components/ui/progress.jsx",
        "usage": "Countdown 48h / stato ordine"
      },
      "table": {
        "path": "/app/frontend/src/components/ui/table.jsx",
        "usage": "Admin ordini/pagamenti"
      },
      "sonner_toast": {
        "path": "/app/frontend/src/components/ui/sonner.jsx",
        "usage": "Copia indirizzo/importo, errori pagamento"
      }
    },
    "custom_components_to_build": {
      "pixelated_photo_card_js": {
        "name": "PixelatedPhotoCard",
        "purpose": "Mostrare SOLO immagini pixelate pre-generate (mai originali) con shimmer/crossfade.",
        "props": [
          "srcSet: {a,b,c} (3 varianti pixelate)",
          "price",
          "ctaLabel",
          "onUnlock",
          "locked: boolean"
        ],
        "layout": "aspect-[9/16] rounded-2xl overflow-hidden relative",
        "effects": [
          "crossfade tra 3 immagini con opacity",
          "shimmer overlay leggero (solo opacity/transform)",
          "image-rendering: pixelated",
          "optional blur-[1px]"
        ],
        "badges": [
          "Badge 18+ top-left",
          "Badge 'Sblocca' bottom-right"
        ],
        "overlay": "bottom gradient overlay (nero -> trasparente) per CTA e prezzo",
        "data_testid": "pixelated-photo-card"
      },
      "mobile_bottom_nav_js": {
        "name": "MobileBottomNav",
        "purpose": "Navigazione rapida: Home, Vault, Acquisti, Richieste, Account",
        "data_testid": "mobile-bottom-nav"
      },
      "order_timeline_js": {
        "name": "OrderTimeline",
        "purpose": "Timeline verticale stati ordine con pallini che si accendono",
        "data_testid": "order-status-timeline"
      }
    }
  },
  "pixelated_gallery_spec": {
    "asset_rules": [
      "NON servire mai originali al browser.",
      "Generare 3 varianti pixelate per ogni foto (offset diverso) per shimmer/crossfade.",
      "Formato: verticale 9:16; consigliato 1080x1920 o 720x1280.",
      "Compressione: WebP/AVIF; target < 180KB per immagine."
    ],
    "card_style": {
      "radius": "rounded-2xl (22–24px)",
      "frame": "border border-[var(--border-subtle)]",
      "shadow": "shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
      "hover": "border-color -> rgba(0,175,240,0.45) + glow leggero",
      "tap": "scale-[0.98] (solo su pointer coarse)"
    },
    "animation": {
      "duration_ms": 180,
      "crossfade_interval_ms": 900,
      "easing": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      "reduced_motion": "disabilitare crossfade e shimmer"
    }
  },
  "checkout_and_order_pages": {
    "checkout_page_cassa": {
      "layout": {
        "mobile": "1 colonna; stepper minimo",
        "desktop": "2 colonne: form + riepilogo sticky"
      },
      "components": [
        "RadioGroup per metodo pagamento",
        "Card riepilogo",
        "Checkbox 18+",
        "Button primario 'Conferma e paga'"
      ],
      "badges": [
        "Conferma automatica",
        "Senza commissioni"
      ],
      "data_testids": [
        "checkout-payment-method-radio",
        "checkout-age-checkbox",
        "checkout-confirm-button"
      ]
    },
    "order_page_ordine_code": {
      "hero": {
        "order_code": "monospace grande, tracking-widest",
        "qr": "QR azzurro su fondo scuro (quiet zone rispettata)",
        "primary_cta": "Paga con wallet",
        "secondary": "Copia indirizzo / Copia importo"
      },
      "timeline": {
        "states": [
          "Creato",
          "In attesa pagamento",
          "Confermato",
          "Consegna"
        ],
        "visual": "linea verticale + dot glow azzurro per stato attivo"
      },
      "countdown": "48h con Progress + testo muted",
      "data_testids": [
        "order-code-text",
        "order-qr",
        "order-pay-wallet-button",
        "order-copy-address-button",
        "order-copy-amount-button",
        "order-countdown"
      ]
    }
  },
  "microcopy_it": {
    "cta": {
      "primary": [
        "Sblocca ora",
        "Acquista e vedi subito",
        "Pago e vedo subito"
      ],
      "secondary": [
        "Vedi piani",
        "Apri vault",
        "I miei acquisti"
      ]
    },
    "badges": [
      "18+",
      "Nuovo",
      "Top fan",
      "Tempo limitato",
      "Conferma automatica",
      "Senza commissioni"
    ],
    "helper": [
      "Pagamento verificato: consegna automatica.",
      "Hai 48h per completare il pagamento.",
      "Se paghi ora, vedi subito."
    ]
  },
  "motion_and_interactions": {
    "principles": [
      "Solo opacity/transform per performance.",
      "Durate brevi: 120–220ms UI; 600–900ms per crossfade gallery.",
      "Lenis + framer-motion già presenti: usare entrance soft (y: 8 -> 0, opacity 0 -> 1)."
    ],
    "button_states": {
      "hover": "brightness(1.05) + shadow più forte",
      "active": "scale(0.98)",
      "focus": "ring-2 ring-[--gold] ring-offset-2 ring-offset-[--ink]"
    },
    "scroll": {
      "home": "snap leggero opzionale solo per gallery (non obbligatorio)",
      "reduced_motion": "disabilitare parallax e crossfade"
    }
  },
  "accessibility": {
    "rules": [
      "Touch target minimo 44px.",
      "Contrasto: testo su azzurro preferibilmente ink (#0b0b0d).",
      "prefers-reduced-motion: disabilitare shimmer/crossfade.",
      "Focus visibile su tutti gli elementi interattivi."
    ]
  },
  "performance": {
    "rules": [
      "No backdrop-blur su mobile (già gestito in index.css).",
      "Immagini pixelate: lazy loading + decoding=async.",
      "Evita filtri CSS pesanti su grandi aree; shimmer solo overlay leggero."
    ]
  },
  "image_urls": {
    "note": "Le foto reali verranno fornite dal cliente e devono essere pre-pixelate lato build/asset pipeline. Qui solo placeholder per layout.",
    "placeholders": [
      {
        "category": "home_pixelated_gallery_placeholder",
        "description": "Placeholder verticale 9:16 (da sostituire con asset pixelati reali)",
        "image_url": "https://images.unsplash.com/photo-1520975958225-1c1f4c7b1f3a?auto=format&fit=crop&w=900&q=60"
      }
    ]
  },
  "libraries_and_scaffolds": {
    "framer_motion": {
      "usage": "Animazioni entrance e tap feedback",
      "pattern_js": "import { motion } from 'framer-motion'"
    },
    "optional_canvas_mosaic": {
      "when": "Se si vuole mosaic dinamico invece di 3 immagini pre-pixelate",
      "note": "Preferire pre-render per sicurezza (mai originali). Canvas/WebGL rischia di richiedere originale.",
      "reference": "Implementare solo se si può garantire che la sorgente sia già pixelata."
    }
  },
  "instructions_to_main_agent": [
    "Aggiornare SOLO i valori token in /app/frontend/src/index.css: rimappare --gold* e shadcn --primary/--ring/--border all'azzurro #00AFF0 senza rinominare classi.",
    "Aggiornare .text-gold-sheen e .btn-gold gradient come da specifica (azzurro + blush leggero).",
    "Implementare Home con toggle A/B (Switch o Tabs) e query param; default A.",
    "Above-the-fold: griglia foto pixelate 9:16 full-width; ogni card ha CTA 'Sblocca' e badge 18+; tap apre Drawer acquisto.",
    "Tutti gli elementi interattivi e info chiave devono avere data-testid (kebab-case).",
    "Checkout /cassa: 1 colonna mobile, 2 colonne desktop; RadioGroup metodi + badge; checkbox 18+ obbligatoria.",
    "Ordine /ordine/:code: codice monospaziato grande + QR + timeline verticale + countdown 48h; bottoni copia con toast sonner.",
    "Non usare backdrop-blur su mobile; animazioni solo transform/opacity; rispettare prefers-reduced-motion."
  ],
  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
