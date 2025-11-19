export interface HelpEntry {
  question: string;
  keywords: string[];
  answer: string;
}

export const productHelp: HelpEntry[] = [
  {
    question: "Dashboard Overview",
    keywords: ["dashboard", "home", "main page", "overview"],
    answer: "The Dashboard is your main workspace. Here you can see all your projects, create new ones using the 'Create' button or Cmd/Ctrl + C shortcut, and access the template library. Use the quick action cards to get started quickly."
  },
  {
    question: "Projects Page",
    keywords: ["projects", "projects page", "project list", "my projects"],
    answer: "The Projects page shows all your saved projects. You can open, edit, or delete projects from here. Projects are only added to this list when you click the 'Projects' button to leave the editor - this publishes your saved draft."
  },
  {
    question: "Create Project",
    keywords: ["create", "new project", "create project", "start project"],
    answer: "To create a new project, click the 'Create' button on the Dashboard or use the Cmd/Ctrl + C keyboard shortcut. This will take you directly to the editor where you can start building your presentation."
  },
  {
    question: "Editor Overview",
    keywords: ["editor", "edit", "editing", "canvas", "workspace"],
    answer: "The editor is where you create and edit your slides. The left panel shows all your slides - click any slide to switch to it. The right panel has formatting options for selected elements. You can toggle both panels on/off using the edge buttons for more workspace. The canvas stays fixed at the top and expands when panels are hidden."
  },
  {
    question: "Templates",
    keywords: ["template", "templates", "slide template", "add slide", "template library"],
    answer: "Templates help you create professional slides quickly. You can access the template library from the Dashboard by clicking 'Start from template'. In the editor, use the 'New' button in the Slides panel to add a blank slide. Template 1 is a branded presentation deck aligned to Aramco Digital's palette."
  },
  {
    question: "Saving Projects",
    keywords: ["save", "saving", "save project", "how to save", "draft"],
    answer: "Click the blue 'Save' button in the top-right corner of the editor to save your work as a draft. This saves locally in the editor but does NOT publish to your Projects list yet. When you're ready to publish, click the 'Projects' button to leave the editor - your saved draft will be automatically published to the Projects list at that moment."
  },
  {
    question: "Revert Changes",
    keywords: ["revert", "undo", "discard", "cancel changes", "revert to saved"],
    answer: "If you want to undo your unsaved changes and go back to the last saved draft, click the 'Revert' button next to the Save button. This will restore your project to the state of the last time you clicked Save."
  },
  {
    question: "Keyboard Shortcuts",
    keywords: ["shortcut", "shortcuts", "keyboard", "hotkey", "cmd", "ctrl"],
    answer: "Here are the main keyboard shortcuts: Cmd/Ctrl + S to save your project, Cmd/Ctrl + N for a new project, and Cmd/Ctrl + C to create a new project from the dashboard. In the editor, you can use standard editing shortcuts for text formatting."
  },
  {
    question: "Side Panels",
    keywords: ["panel", "panels", "sidebar", "slides panel", "hide panel", "show panel"],
    answer: "The editor has two collapsible side panels. The left panel shows all your slides. The right panel has formatting options for selected elements. Click the edge buttons ('Show/Hide Slides' and 'Show/Hide Sidebar') to toggle panels. When panels are hidden, the canvas expands for a focused editing experience."
  },
  {
    question: "Focus Mode",
    keywords: ["focus mode", "full screen", "hide panels", "maximize canvas"],
    answer: "To enter focus mode, hide both side panels using the edge toggle buttons. The canvas will expand to almost full width, giving you maximum space for editing. The canvas stays fixed at the top and doesn't move when you toggle panels."
  },
  {
    question: "Slide Transitions",
    keywords: ["switch slide", "change slide", "slide transition", "navigate slides"],
    answer: "Click any slide in the left panel to switch to it. The canvas will smoothly fade to the new slide. You can also add new slides, duplicate slides, or delete slides using the buttons in the Slides panel."
  },
  {
    question: "Text Editing",
    keywords: ["text", "text box", "edit text", "format text", "typography"],
    answer: "Double-click on the canvas to add a text box, or use the 'Text Box' button in the toolbar. Select any text element to see formatting options in the right panel: font size, bold, italic, underline, alignment, color, and line height."
  },
  {
    question: "Shapes and Media",
    keywords: ["shape", "shapes", "image", "media", "upload", "rectangle", "circle"],
    answer: "Use the toolbar to add shapes (rectangle, circle, triangle, arrow) or upload images. You can also add images from URLs or embed videos. Select any element to format it using the right panel."
  }
];

