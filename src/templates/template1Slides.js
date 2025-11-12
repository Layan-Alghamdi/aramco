import logoAsset from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";

export const BASE_WIDTH = 1280;
export const BASE_HEIGHT = 720;

// Utility to convert design pixels to normalized values when needed
export const px = (value) => value;

const defaultFontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

export const template1Slides = [
  {
    id: "slide-1",
    name: "Cover",
    backgroundImage: "/templates/template1_slides/slide-001.png",
    layers: [
      {
        key: "title",
        label: "Title",
        type: "text",
        defaultValue: "SASE",
        style: {
          left: px(120),
          top: px(240),
          width: px(640),
          height: px(160),
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#FFFFFF",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "subtitle",
        label: "Subtitle",
        type: "text",
        defaultValue: "Empowering Developers with SASE",
        style: {
          left: px(120),
          top: px(380),
          width: px(720),
          height: px(120),
          fontSize: 30,
          fontWeight: 400,
          lineHeight: 1.4,
          color: "#E9F2FF",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "tagline",
        label: "Tagline / Date",
        type: "text",
        defaultValue: "April 22, 2025",
        style: {
          left: px(120),
          top: px(580),
          width: px(360),
          height: px(60),
          fontSize: 24,
          fontWeight: 600,
          lineHeight: 1.3,
          color: "#FFFFFF",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      }
    ],
    logo: {
      key: "logo",
      label: "Logo",
      defaultValue: logoAsset,
      position: {
        left: px(980),
        top: px(70),
        width: px(220),
        height: px(90)
      }
    }
  },
  {
    id: "slide-2",
    name: "What is SASE",
    backgroundImage: "/templates/template1_slides/slide-002.png",
    layers: [
      {
        key: "title",
        label: "Slide Title",
        type: "text",
        defaultValue: "What is SASE?",
        style: {
          left: px(120),
          top: px(80),
          width: px(800),
          height: px(80),
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1E3A8A",
          letterSpacing: -0.5,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "body",
        label: "Body",
        type: "text",
        defaultValue:
          "SASE (Secure Access Service Edge) is a cloud-based framework that brings network connectivity and security together into a single, simplified platform.\n\nWhy Developers Need It:\n• Secure access to development environments, code repositories, and tools from any location.\n• Protect sensitive data while ensuring seamless workflows.",
        style: {
          left: px(120),
          top: px(190),
          width: px(1040),
          height: px(420),
          fontSize: 28,
          fontWeight: 400,
          lineHeight: 1.45,
          color: "#111827",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      }
    ],
    logo: {
      key: "logo",
      label: "Logo",
      defaultValue: logoAsset,
      position: {
        left: px(1020),
        top: px(50),
        width: px(200),
        height: px(80)
      }
    }
  },
  {
    id: "slide-3",
    name: "Developer workflows",
    backgroundImage: "/templates/template1_slides/slide-003.png",
    layers: [
      {
        key: "title",
        label: "Slide Title",
        type: "text",
        defaultValue: "How SASE Supercharges Developer Workflows:",
        style: {
          left: px(120),
          top: px(80),
          width: px(960),
          height: px(80),
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.25,
          color: "#1E3A8A",
          letterSpacing: -0.4,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "body",
        label: "Body",
        type: "text",
        defaultValue:
          "• Zero Trust Security: Ensures only authorized users access your systems by continuously validating every request.\n• Secure Version Control: Protects your code repositories (GitHub, GitLab) while you manage them effortlessly.\n• Containerized Environments: Secures your Docker and Kubernetes environments for smooth, safe development.\n• API Access: Keeps your APIs secure, ensuring uninterrupted and safe integration.",
        style: {
          left: px(140),
          top: px(210),
          width: px(1000),
          height: px(380),
          fontSize: 28,
          fontWeight: 400,
          lineHeight: 1.5,
          color: "#111827",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      }
    ],
    logo: {
      key: "logo",
      label: "Logo",
      defaultValue: logoAsset,
      position: {
        left: px(1020),
        top: px(50),
        width: px(200),
        height: px(80)
      }
    }
  },
  {
    id: "slide-4",
    name: "Why embrace",
    backgroundImage: "/templates/template1_slides/slide-004.png",
    layers: [
      {
        key: "title",
        label: "Slide Title",
        type: "text",
        defaultValue: "Why Developers Should Embrace SASE:",
        style: {
          left: px(120),
          top: px(90),
          width: px(960),
          height: px(80),
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1E3A8A",
          letterSpacing: -0.4,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "columnOne",
        label: "Column 1",
        type: "text",
        defaultValue: "Seamless Integration:\nSASE fits right into your workflow, supports tools without disruption.",
        style: {
          left: px(140),
          top: px(220),
          width: px(340),
          height: px(260),
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#0F172A",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "columnTwo",
        label: "Column 2",
        type: "text",
        defaultValue: "Boosted Performance:\nOptimized security and network performance.",
        style: {
          left: px(480),
          top: px(220),
          width: px(340),
          height: px(260),
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#0F172A",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "columnThree",
        label: "Column 3",
        type: "text",
        defaultValue: "Scalable Security:\nSASE adapts to meet your security needs without slowing down productivity.",
        style: {
          left: px(820),
          top: px(220),
          width: px(340),
          height: px(260),
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#0F172A",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      }
    ],
    logo: {
      key: "logo",
      label: "Logo",
      defaultValue: logoAsset,
      position: {
        left: px(1020),
        top: px(50),
        width: px(200),
        height: px(80)
      }
    }
  },
  {
    id: "slide-5",
    name: "Key benefits",
    backgroundImage: "/templates/template1_slides/slide-005.png",
    layers: [
      {
        key: "title",
        label: "Slide Title",
        type: "text",
        defaultValue: "Key Benefits of SASE for Developers:",
        style: {
          left: px(120),
          top: px(90),
          width: px(960),
          height: px(80),
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1E3A8A",
          letterSpacing: -0.4,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "cardOne",
        label: "Card 1",
        type: "text",
        defaultValue: "Security:\nSafeguard code, databases, and APIs from unauthorized access.",
        style: {
          left: px(160),
          top: px(230),
          width: px(300),
          height: px(260),
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#0F172A",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "cardTwo",
        label: "Card 2",
        type: "text",
        defaultValue: "Speed:\nEnjoy faster access to cloud tools, reducing lag in development processes.",
        style: {
          left: px(520),
          top: px(230),
          width: px(300),
          height: px(260),
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#0F172A",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      },
      {
        key: "cardThree",
        label: "Card 3",
        type: "text",
        defaultValue: "Remote Work:\nWork securely from anywhere without disruptions to productivity.",
        style: {
          left: px(880),
          top: px(230),
          width: px(320),
          height: px(260),
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#0F172A",
          letterSpacing: 0,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      }
    ],
    logo: {
      key: "logo",
      label: "Logo",
      defaultValue: logoAsset,
      position: {
        left: px(1020),
        top: px(40),
        width: px(200),
        height: px(80)
      }
    }
  },
  {
    id: "slide-6",
    name: "Thank you",
    backgroundImage: "/templates/template1_slides/slide-006.png",
    layers: [
      {
        key: "title",
        label: "Title",
        type: "text",
        defaultValue: "Thank you",
        style: {
          left: px(200),
          top: px(320),
          width: px(640),
          height: px(120),
          fontSize: 86,
          fontWeight: 700,
          lineHeight: 1.1,
          color: "#1E3A8A",
          letterSpacing: -0.6,
          fontFamily: defaultFontFamily,
          align: "left"
        }
      }
    ],
    logo: {
      key: "logo",
      label: "Logo",
      defaultValue: logoAsset,
      position: {
        left: px(1020),
        top: px(40),
        width: px(200),
        height: px(80)
      }
    }
  }
];
