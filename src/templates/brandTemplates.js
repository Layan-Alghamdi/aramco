const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}`);

const baseFonts = ["Poppins", "Inter", "Open Sans", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial"];

const palette = {
  deepBlue: "#0A2342",
  midBlue: "#3E6DCC",
  lightBlue: "#A9C7FF",
  softBlue: "#E6EEFF",
  emerald: "#0C7C59",
  white: "#FFFFFF",
  gray: "#6B7280",
  charcoal: "#1E1E1E"
};

let zIndexSeed = 1;
const nextZIndex = () => zIndexSeed++;

const defaultText = ({ text, fontSize = 34, weight = 600, color = palette.charcoal, align = "left", x, y, w, h }) => ({
  id: `txt-${uid()}`,
  type: "text",
  x,
  y,
  w,
  h,
  rot: 0,
  text,
  html: text,
  fontFamily: baseFonts[0],
  fontSize,
  fontWeight: weight,
  italic: false,
  underline: false,
  align,
  color,
  lineHeight: 1.2,
  highlight: "transparent",
  zIndex: nextZIndex()
});

const defaultRect = ({ x, y, w, h, fill, stroke = "transparent", strokeWidth = 0, opacity = 1, radius = 24 }) => ({
  id: `rect-${uid()}`,
  type: "shape",
  shape: "rectangle",
  x,
  y,
  w,
  h,
  rot: 0,
  fill,
  stroke,
  strokeWidth,
  opacity,
  radius,
  zIndex: nextZIndex()
});

const createSlide = (title, objects) => ({
  id: uid(),
  title,
  objects
});

export const slideTemplates = [
  {
    id: "title-hero",
    name: "Title Slide",
    description: "Bold hero slide with radial brand glow and company watermark.",
    watermark: true,
    previewAccent: palette.midBlue,
    slides: [
      createSlide("Title", [
        defaultRect({ x: 0, y: 0, w: 960, h: 540, fill: "linear-gradient(135deg, #E6EEFF 0%, #3E6DCC 100%)", opacity: 0.35 }),
        defaultText({ text: "Presentation Title", fontSize: 52, weight: 700, x: 220, y: 150, w: 520, h: 160, align: "center", color: palette.white }),
        defaultText({ text: "Subtitle or key takeaway", fontSize: 24, weight: 400, x: 260, y: 285, w: 440, h: 80, align: "center", color: palette.lightBlue })
      ])
    ]
  },
  {
    id: "text-image",
    name: "Text + Image",
    description: "Split layout balancing narrative and visual storytelling.",
    previewAccent: palette.emerald,
    slides: [
      createSlide("Story", [
        defaultText({ text: "Strategic Initiative", fontSize: 36, weight: 600, x: 80, y: 80, w: 360, h: 120 }),
        defaultText({
          text: "Communicate the core insight, thesis, or customer impact here.",
          fontSize: 20,
          weight: 400,
          x: 80,
          y: 180,
          w: 360,
          h: 200,
          color: palette.gray,
          lineHeight: 1.5
        }),
        defaultRect({ x: 470, y: 70, w: 380, h: 320, fill: "linear-gradient(160deg, #00A19A 0%, #3E6DCC 100%)", radius: 36 }),
        defaultRect({ x: 500, y: 100, w: 320, h: 220, fill: "#FFFFFF", opacity: 0.85, radius: 24 })
      ])
    ]
  },
  {
    id: "two-column",
    name: "Two-Column",
    description: "Balanced columns for comparison, project phases, or KPIs.",
    previewAccent: palette.lightBlue,
    slides: [
      createSlide("Two Column", [
        defaultText({ text: "North Star Metrics", fontSize: 34, weight: 600, x: 80, y: 70, w: 800, h: 80 }),
        defaultRect({ x: 80, y: 160, w: 340, h: 280, fill: "#FFFFFF", stroke: palette.lightBlue, strokeWidth: 2, radius: 30 }),
        defaultRect({ x: 520, y: 160, w: 340, h: 280, fill: "#FFFFFF", stroke: palette.midBlue, strokeWidth: 2, radius: 30 }),
        defaultText({ text: "Current State", fontSize: 24, weight: 600, x: 110, y: 190, w: 280, h: 60 }),
        defaultText({ text: "Future Vision", fontSize: 24, weight: 600, x: 550, y: 190, w: 280, h: 60 }),
        defaultText({
          text: "Highlight present-day metrics, obstacles, constraints.",
          fontSize: 18,
          weight: 400,
          x: 110,
          y: 250,
          w: 280,
          h: 160,
          color: palette.gray,
          lineHeight: 1.5
        }),
        defaultText({
          text: "Describe the desired outcomes, leading indicators, and path.",
          fontSize: 18,
          weight: 400,
          x: 550,
          y: 250,
          w: 280,
          h: 160,
          color: palette.gray,
          lineHeight: 1.5
        })
      ])
    ]
  },
  {
    id: "data-insight",
    name: "Data & Insight",
    description: "Data-first slide with insight callout and placeholders for charts.",
    previewAccent: palette.midBlue,
    slides: [
      createSlide("Data", [
        defaultText({ text: "Operational Performance", fontSize: 36, weight: 600, x: 80, y: 70, w: 800, h: 80 }),
        defaultRect({ x: 80, y: 160, w: 420, h: 260, fill: "#FFFFFF", stroke: "#D9E4FF", strokeWidth: 2, radius: 32 }),
        defaultRect({ x: 530, y: 160, w: 350, h: 160, fill: "linear-gradient(140deg, #0C7C59 0%, #3E6DCC 100%)", radius: 28, opacity: 0.88 }),
        defaultText({
          text: "Insight Headline",
          fontSize: 28,
          weight: 600,
          align: "center",
          x: 550,
          y: 180,
          w: 300,
          h: 60,
          color: palette.white
        }),
        defaultText({
          text: "Summarize the key takeaway from this dataset in a single sentence.",
          fontSize: 18,
          weight: 400,
          align: "center",
          x: 550,
          y: 235,
          w: 300,
          h: 80,
          color: palette.white,
          lineHeight: 1.45
        })
      ])
    ]
  },
  {
    id: "quote-impact",
    name: "Quote",
    description: "Impactful quote treatment with speaker attribution.",
    previewAccent: palette.white,
    slides: [
      createSlide("Quote", [
        defaultRect({ x: 120, y: 120, w: 720, h: 280, fill: "#FFFFFF", stroke: "#C7D6FF", strokeWidth: 2, radius: 40 }),
        defaultText({
          text: "“Innovation is the ability to see change as an opportunity – not a threat.”",
          fontSize: 28,
          weight: 600,
          align: "center",
          x: 160,
          y: 160,
          w: 640,
          h: 160,
          lineHeight: 1.4
        }),
        defaultText({
          text: "Steve Jobs",
          fontSize: 20,
          weight: 500,
          align: "center",
          x: 160,
          y: 300,
          w: 640,
          h: 80,
          color: palette.gray
        })
      ])
    ]
  },
  {
    id: "summary-thanks",
    name: "Summary / Thank You",
    description: "Closing slide with key bullet points and contact space.",
    previewAccent: palette.emerald,
    slides: [
      createSlide("Summary", [
        defaultRect({ x: 80, y: 70, w: 800, h: 160, fill: "linear-gradient(145deg, #0C7C59 0%, #3E6DCC 100%)", radius: 36 }),
        defaultText({ text: "Thank you", fontSize: 42, weight: 700, align: "center", x: 200, y: 100, w: 520, h: 120, color: palette.white }),
        defaultText({
          text: "• Key insight #1\n• Key insight #2\n• Next step or call to action",
          fontSize: 22,
          weight: 500,
          x: 120,
          y: 260,
          w: 360,
          h: 200,
          lineHeight: 1.6
        }),
        defaultText({
          text: "Contact\nname@aramcodigital.com\n+966 12 345 6789",
          fontSize: 18,
          weight: 400,
          x: 520,
          y: 260,
          w: 280,
          h: 200,
          lineHeight: 1.5,
          color: palette.gray
        })
      ])
    ]
  }
];

export const slideTemplateMap = Object.fromEntries(slideTemplates.map((template) => [template.id, template]));

export function cloneTemplateSlides(templateId) {
  const template = slideTemplateMap[templateId];
  if (!template) return [];

  const cloneObject = (obj) => {
    const base = JSON.parse(JSON.stringify(obj));
    const prefix = base.id && typeof base.id === "string" ? base.id.split("-")[0] : "obj";
    base.id = `${prefix}-${uid()}`;
    if (base.type === "rect") {
      base.type = "shape";
      base.shape = "rectangle";
    }
    if (base.type === "ellipse") {
      base.type = "shape";
      base.shape = "circle";
    }
    if (base.type === "triangle") {
      base.type = "shape";
      base.shape = "triangle";
    }
    if (base.type === "text") {
      base.html = base.html ?? base.text ?? "";
      base.highlight = base.highlight ?? "transparent";
    }
    base.zIndex = nextZIndex();
    return base;
  };

  return template.slides.map((slide) => {
    const baseSlide = JSON.parse(JSON.stringify(slide));
    baseSlide.id = uid();
    baseSlide.objects = baseSlide.objects.map(cloneObject);
    return baseSlide;
  });
}

