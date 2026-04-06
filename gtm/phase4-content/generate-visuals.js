const path = require("path");
const fs = require("fs");
const globalPath = require("child_process").execSync("npm root -g").toString().trim();
const pptxgen = require(path.join(globalPath, "pptxgenjs"));

const LOGO_PATH = path.resolve(__dirname, "../../Frontend/apps/web/public/images/logo.png");
const OUT_DIR = __dirname;

// Brand colors (no # prefix)
const NAVY = "1F2937";
const GOLD = "C3924D";
const GOLD_DARK = "A67939";
const WHITE = "FFFFFF";
const WHITE_DIM = "D1D5DB";
const GOLD_MUTED = "D4A96A";

// Logo dimensions in inches (541x126px, preserve ratio)
const LOGO_H = 0.35;
const LOGO_W = LOGO_H * (541 / 126);

// =============================================
// HELPER: Create slide content for both sizes
// =============================================

function addLaunchSlide(pres, slide, W, H, isSquare) {
  // Background
  slide.background = { color: NAVY };

  // Subtle gold line at top
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { color: GOLD },
  });

  // Logo top-right (RTL = visually top-right)
  const logoX = isSquare ? 0.6 : 0.5;
  const logoY = isSquare ? 0.45 : 0.3;
  slide.addImage({
    path: LOGO_PATH,
    x: logoX, y: logoY,
    w: LOGO_W, h: LOGO_H,
  });

  // "Vault" badge next to logo
  slide.addText("Vault", {
    x: logoX + LOGO_W + 0.15, y: logoY - 0.02,
    w: 0.85, h: 0.38,
    fontSize: 14, fontFace: "Cairo",
    color: NAVY, bold: true,
    fill: { color: GOLD },
    align: "center", valign: "middle",
    rectRadius: 0.05,
  });

  // Headline
  const headY = isSquare ? 1.3 : 1.0;
  const headSize = isSquare ? 36 : 32;
  slide.addText("أين وثائق شركتك الآن؟", {
    x: 0.5, y: headY, w: W - 1, h: isSquare ? 0.9 : 0.7,
    fontSize: headSize, fontFace: "Cairo",
    color: WHITE, bold: true,
    align: "right", valign: "middle",
    isTextBox: true, rtlMode: true,
  });

  // Subtext
  const subY = headY + (isSquare ? 1.1 : 0.85);
  slide.addText(
    "في إيميل المدير المالي؟ في مجموعة واتساب؟ على جهاز موظف غادر الشركة من ستة أشهر؟",
    {
      x: 0.5, y: subY, w: W - 1, h: isSquare ? 1.0 : 0.7,
      fontSize: isSquare ? 16 : 14, fontFace: "Cairo",
      color: WHITE_DIM,
      align: "right", valign: "top",
      isTextBox: true, rtlMode: true,
    }
  );

  // 4 feature points with gold squares
  const features = [
    "مساحات عمل محوكمة مع تصنيف ذكي",
    "خمسة مستويات صلاحيات، من عارض إلى مدير",
    "سجل تدقيق كامل بالمستخدم والتاريخ",
    "تكامل مباشر مع سجل المساهمين",
  ];

  const startY = subY + (isSquare ? 1.3 : 0.9);
  const spacing = isSquare ? 0.65 : 0.5;
  const bulletSize = isSquare ? 0.18 : 0.15;
  const textSize = isSquare ? 15 : 13;
  const rightEdge = W - 0.5;

  features.forEach((text, i) => {
    const y = startY + i * spacing;
    // Gold square bullet (right side for RTL)
    slide.addShape(pres.shapes.RECTANGLE, {
      x: rightEdge - bulletSize,
      y: y + 0.05,
      w: bulletSize, h: bulletSize,
      fill: { color: GOLD },
    });
    // Feature text
    slide.addText(text, {
      x: 0.5, y: y,
      w: rightEdge - bulletSize - 0.7,
      h: spacing - 0.05,
      fontSize: textSize, fontFace: "Cairo",
      color: WHITE,
      align: "right", valign: "middle",
      isTextBox: true, rtlMode: true,
    });
  });

  // CTA button area
  const ctaY = startY + features.length * spacing + (isSquare ? 0.4 : 0.25);
  const ctaW = 2.2;
  const ctaH = 0.5;
  const ctaX = rightEdge - ctaW;

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: ctaX, y: ctaY, w: ctaW, h: ctaH,
    fill: { color: GOLD },
    rectRadius: 0.08,
  });
  slide.addText("فعّل Vault", {
    x: ctaX, y: ctaY, w: ctaW, h: ctaH,
    fontSize: 16, fontFace: "Cairo",
    color: NAVY, bold: true,
    align: "center", valign: "middle",
    margin: 0,
  });

  // Bottom bar
  const barY = H - (isSquare ? 0.85 : 0.65);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: barY, w: W, h: 0.01,
    fill: { color: GOLD },
  });

  // Scarcity + tagline
  slide.addText("أول 30 شركة فقط", {
    x: W / 2, y: barY + 0.08, w: W / 2 - 0.5, h: 0.35,
    fontSize: 12, fontFace: "Cairo",
    color: GOLD_MUTED, bold: true,
    align: "right", valign: "middle",
    rtlMode: true,
  });
  slide.addText("حوكمة سعودية. منصة عالمية.", {
    x: 0.5, y: barY + 0.08, w: W / 2 - 0.5, h: 0.35,
    fontSize: 11, fontFace: "Cairo",
    color: WHITE_DIM,
    align: "left", valign: "middle",
    rtlMode: true,
  });
}

function addShareholderSlide(pres, slide, W, H, isSquare) {
  // Background
  slide.background = { color: NAVY };

  // Top gold line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { color: GOLD },
  });

  // Logo top-right
  const logoX = isSquare ? 0.6 : 0.5;
  const logoY = isSquare ? 0.45 : 0.3;
  slide.addImage({
    path: LOGO_PATH,
    x: logoX, y: logoY,
    w: LOGO_W, h: LOGO_H,
  });

  // Vault badge
  slide.addText("Vault", {
    x: logoX + LOGO_W + 0.15, y: logoY - 0.02,
    w: 0.85, h: 0.38,
    fontSize: 14, fontFace: "Cairo",
    color: NAVY, bold: true,
    fill: { color: GOLD },
    align: "center", valign: "middle",
    rectRadius: 0.05,
  });

  // Headline
  const headY = isSquare ? 1.3 : 1.0;
  const headSize = isSquare ? 32 : 28;
  slide.addText("هل سجل المساهمين في شركتك مرتبط بوثائقها؟", {
    x: 0.5, y: headY, w: W - 1, h: isSquare ? 1.1 : 0.85,
    fontSize: headSize, fontFace: "Cairo",
    color: WHITE, bold: true,
    align: "right", valign: "middle",
    isTextBox: true, rtlMode: true,
  });

  // 3 feature rows with arrows
  const features = [
    "سجل المساهمين في مساهم \u2190 وثائقهم في Vault",
    "محاضر مجلس الإدارة \u2190 مساحة عمل محوكمة بصلاحيات خمسة مستويات",
    "سجل تدقيق شامل يثبت سلسلة الحفظ",
  ];

  const startY = headY + (isSquare ? 1.6 : 1.2);
  const spacing = isSquare ? 0.85 : 0.65;
  const rightEdge = W - 0.5;
  const textSize = isSquare ? 15 : 13;

  features.forEach((text, i) => {
    const y = startY + i * spacing;
    // Gold left border (right side in RTL)
    slide.addShape(pres.shapes.RECTANGLE, {
      x: rightEdge - 0.06, y: y,
      w: 0.06, h: spacing - 0.15,
      fill: { color: GOLD },
    });
    // Text
    slide.addText(text, {
      x: 0.5, y: y,
      w: rightEdge - 0.8, h: spacing - 0.15,
      fontSize: textSize, fontFace: "Cairo",
      color: WHITE,
      align: "right", valign: "middle",
      isTextBox: true, rtlMode: true,
    });
  });

  // CTA
  const ctaY = startY + features.length * spacing + (isSquare ? 0.3 : 0.15);
  const ctaW = 2.2;
  const ctaH = 0.5;
  const ctaX = rightEdge - ctaW;

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: ctaX, y: ctaY, w: ctaW, h: ctaH,
    fill: { color: GOLD },
    rectRadius: 0.08,
  });
  slide.addText("فعّل Vault", {
    x: ctaX, y: ctaY, w: ctaW, h: ctaH,
    fontSize: 16, fontFace: "Cairo",
    color: NAVY, bold: true,
    align: "center", valign: "middle",
    margin: 0,
  });

  // Bottom bar
  const barY = H - (isSquare ? 0.85 : 0.65);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: barY, w: W, h: 0.01,
    fill: { color: GOLD },
  });

  slide.addText("أول 30 شركة فقط", {
    x: W / 2, y: barY + 0.08, w: W / 2 - 0.5, h: 0.35,
    fontSize: 12, fontFace: "Cairo",
    color: GOLD_MUTED, bold: true,
    align: "right", valign: "middle",
    rtlMode: true,
  });
  slide.addText("حوكمة سعودية. منصة عالمية.", {
    x: 0.5, y: barY + 0.08, w: W / 2 - 0.5, h: 0.35,
    fontSize: 11, fontFace: "Cairo",
    color: WHITE_DIM,
    align: "left", valign: "middle",
    rtlMode: true,
  });
}

function addWorkflowSlide(pres, slide, W, H, isSquare) {
  // Background
  slide.background = { color: NAVY };

  // Top gold line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { color: GOLD },
  });

  // Logo top-right
  const logoX = isSquare ? 0.6 : 0.5;
  const logoY = isSquare ? 0.45 : 0.3;
  slide.addImage({
    path: LOGO_PATH,
    x: logoX, y: logoY,
    w: LOGO_W, h: LOGO_H,
  });

  // Vault badge
  slide.addText("Vault", {
    x: logoX + LOGO_W + 0.15, y: logoY - 0.02,
    w: 0.85, h: 0.38,
    fontSize: 14, fontFace: "Cairo",
    color: NAVY, bold: true,
    fill: { color: GOLD },
    align: "center", valign: "middle",
    rectRadius: 0.05,
  });

  // Headline: DMS identity
  const headY = isSquare ? 1.3 : 0.95;
  const headSize = isSquare ? 30 : 26;
  slide.addText("نظام إدارة وثائق متكامل", {
    x: 0.5, y: headY, w: W - 1, h: isSquare ? 0.8 : 0.6,
    fontSize: headSize, fontFace: "Cairo",
    color: WHITE, bold: true,
    align: "right", valign: "middle",
    isTextBox: true, rtlMode: true,
  });

  // 4-step flow: Upload > Classify > Approve > Share
  const steps = [
    { icon: "\u2B06", label: "ارفع" },
    { icon: "\uD83C\uDFF7\uFE0F", label: "صنّف" },
    { icon: "\u2705", label: "اعتمد" },
    { icon: "\uD83D\uDD17", label: "شارك" },
  ];

  const flowY = headY + (isSquare ? 1.4 : 1.0);
  const stepW = isSquare ? 1.8 : 1.7;
  const totalFlow = steps.length * stepW + (steps.length - 1) * 0.3;
  const flowStartX = (W - totalFlow) / 2;

  steps.forEach((step, i) => {
    const x = flowStartX + i * (stepW + 0.3);

    // Gold circle background for icon
    const circleSize = isSquare ? 1.1 : 0.9;
    slide.addShape(pres.shapes.OVAL, {
      x: x + (stepW - circleSize) / 2,
      y: flowY,
      w: circleSize, h: circleSize,
      fill: { color: GOLD },
    });

    // Step label below circle
    slide.addText(step.label, {
      x: x, y: flowY + circleSize + 0.15,
      w: stepW, h: 0.45,
      fontSize: isSquare ? 18 : 16, fontFace: "Cairo",
      color: WHITE, bold: true,
      align: "center", valign: "middle",
    });

    // Arrow between steps (not after last)
    if (i < steps.length - 1) {
      const arrowX = x + stepW + 0.02;
      slide.addText("\u2192", {
        x: arrowX, y: flowY + circleSize * 0.25,
        w: 0.26, h: 0.5,
        fontSize: isSquare ? 22 : 20,
        color: GOLD_MUTED,
        align: "center", valign: "middle",
        rtlMode: false,
      });
    }
  });

  // Step numbers inside circles
  steps.forEach((step, i) => {
    const x = flowStartX + i * (stepW + 0.3);
    const circleSize = isSquare ? 1.1 : 0.9;
    slide.addText(String(i + 1), {
      x: x + (stepW - circleSize) / 2,
      y: flowY,
      w: circleSize, h: circleSize,
      fontSize: isSquare ? 36 : 30, fontFace: "Cairo",
      color: NAVY, bold: true,
      align: "center", valign: "middle",
    });
  });

  // CTA
  const ctaY = flowY + (isSquare ? 2.4 : 1.8);
  const ctaW = 2.2;
  const ctaH = 0.5;
  const rightEdge = W - 0.5;
  const ctaX = rightEdge - ctaW;

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: ctaX, y: ctaY, w: ctaW, h: ctaH,
    fill: { color: GOLD },
    rectRadius: 0.08,
  });
  slide.addText("فعّل Vault", {
    x: ctaX, y: ctaY, w: ctaW, h: ctaH,
    fontSize: 16, fontFace: "Cairo",
    color: NAVY, bold: true,
    align: "center", valign: "middle",
    margin: 0,
  });

  // Bottom bar
  const barY = H - (isSquare ? 0.85 : 0.65);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: barY, w: W, h: 0.01,
    fill: { color: GOLD },
  });

  slide.addText("ملفات. صلاحيات. سير عمل. تدقيق.", {
    x: W / 2, y: barY + 0.08, w: W / 2 - 0.5, h: 0.35,
    fontSize: 12, fontFace: "Cairo",
    color: GOLD_MUTED, bold: true,
    align: "right", valign: "middle",
    rtlMode: true,
  });
  slide.addText("حوكمة سعودية. منصة عالمية.", {
    x: 0.5, y: barY + 0.08, w: W / 2 - 0.5, h: 0.35,
    fontSize: 11, fontFace: "Cairo",
    color: WHITE_DIM,
    align: "left", valign: "middle",
    rtlMode: true,
  });
}

// =============================================
// FILE 1: LinkedIn Landscape (1200x628 ratio)
// =============================================

async function createLinkedIn() {
  const pres = new pptxgen();
  // 1200:628 ratio => 12.5" x 6.5417" => scale down to 10" x 5.233"
  const W = 10;
  const H = 5.233;
  pres.defineLayout({ name: "LINKEDIN", width: W, height: H });
  pres.layout = "LINKEDIN";
  pres.author = "Musahm";
  pres.title = "Musahm Vault - Social Media Visuals (LinkedIn)";

  const slide1 = pres.addSlide();
  addLaunchSlide(pres, slide1, W, H, false);

  const slide2 = pres.addSlide();
  addShareholderSlide(pres, slide2, W, H, false);

  const slide3 = pres.addSlide();
  addWorkflowSlide(pres, slide3, W, H, false);

  const outPath = path.join(OUT_DIR, "final-social-visuals-linkedin.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log("Created:", outPath);
}

// =============================================
// FILE 2: Square (1080x1080 ratio)
// =============================================

async function createSquare() {
  const pres = new pptxgen();
  const W = 10;
  const H = 10;
  pres.defineLayout({ name: "SQUARE", width: W, height: H });
  pres.layout = "SQUARE";
  pres.author = "Musahm";
  pres.title = "Musahm Vault - Social Media Visuals (Square)";

  const slide1 = pres.addSlide();
  addLaunchSlide(pres, slide1, W, H, true);

  const slide2 = pres.addSlide();
  addShareholderSlide(pres, slide2, W, H, true);

  const slide3 = pres.addSlide();
  addWorkflowSlide(pres, slide3, W, H, true);

  const outPath = path.join(OUT_DIR, "final-social-visuals-square.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log("Created:", outPath);
}

// =============================================
// RUN
// =============================================

async function main() {
  await createLinkedIn();
  await createSquare();
  console.log("\nDone. Two files created in:", OUT_DIR);
}

main().catch(console.error);
