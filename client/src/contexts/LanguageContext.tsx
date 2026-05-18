import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "zh";

export const translations = {
  en: {
    // Navbar
    nav: {
      home: "Home",
      subjects: "Subjects",
      upload: "Upload",
      aiAssistant: "AI Assistant",
      review: "Review",
      adminLogin: "Admin Login",
      exitAdmin: "Exit Admin",
      adminMode: "Admin mode",
      adminModeActive: "Administrator mode active",
      exitAdminMode: "Exit Admin Mode",
      login: "Login",
      logout: "Logout",
    },
    // Home page
    home: {
      badge: "Open Collaborative Platform for Students",
      title: "The",
      titleBrand: "LanguageBridge",
      subtitle: "Help exchange students better understand bilingual courses through collaborative courseware sharing.",
      browseSubjects: "Browse Subjects",
      uploadCourseware: "Upload Courseware",
      loginToUpload: "Login to Upload",
      coursewares: "Coursewares",
      subjects: "Subjects",
      community: "Community",
      open: "Open",
      exploreBySubject: "Explore by Subject",
      exploreSubtitle: "Browse courseware organized by subject",
      viewAll: "View All",
      recentlyUploaded: "Recently Uploaded",
      recentSubtitle: "Latest courseware from the community",
      noCoursewares: "No coursewares uploaded yet. Be the first to contribute!",
      footer: "© 2026 The LanguageBridge. All rights reserved.",
    },
    // Subjects page
    subjects: {
      title: "Browse Subjects",
      subtitle: "Find courseware organized by subject",
      searchPlaceholder: "Search coursewares...",
      allSubjects: "All Subjects",
      noResults: "No coursewares found",
      noResultsSubtitle: "Try adjusting your search or filter.",
      uploaderLabel: "Uploaded by",
      anonymous: "Anonymous",
      download: "Download",
      downloading: "Downloading...",
      loginToDownload: "Login to Download",
      pending: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
    },
    // Upload page
    upload: {
      title: "Upload Courseware",
      subtitle: "Share your academic materials with the community",
      titleEn: "Title (English)",
      titleCn: "Title (Chinese)",
      titleEnPlaceholder: "Enter courseware title in English",
      titleCnPlaceholder: "Enter courseware title in Chinese (optional)",
      descriptionEn: "Description (English)",
      descriptionCn: "Description (Chinese)",
      descriptionEnPlaceholder: "Describe the courseware content in English",
      descriptionCnPlaceholder: "Describe the courseware content in Chinese (optional)",
      subject: "Subject",
      selectSubject: "Select a subject",
      file: "File",
      uploaderName: "Your Name",
      uploaderNamePlaceholder: "Enter your name (optional)",
      submit: "Upload Courseware",
      submitting: "Uploading...",
      successTitle: "Upload Successful",
      successMessage: "Your courseware has been submitted for review.",
      uploadAnother: "Upload Another",
    },
    // Courseware detail
    detail: {
      back: "Back",
      subject: "Subject",
      uploadedBy: "Uploaded by",
      anonymous: "Anonymous",
      uploadedOn: "Uploaded on",
      fileType: "File Type",
      status: "Status",
      download: "Download",
      downloading: "Downloading...",
      loginToDownload: "Login to Download",
      descriptionEn: "Description (English)",
      descriptionCn: "Description (Chinese)",
      aiAssistant: "AI Assistant",
      aiSubtitle: "Ask questions about this courseware",
      aiPlaceholder: "Ask about this courseware...",
    },
    // AI Assistant page
    ai: {
      title: "AI Assistant",
      subtitle: "Your multilingual academic assistant for LanguageBridge",
      description: "Ask me anything about the courseware on this platform, academic concepts in subjects such as Physics, Chemistry, Biology, or Calculus BC, or how to navigate LanguageBridge. I can respond in any language — just ask in the language you prefer.",
      placeholder: "Ask me anything about courseware or academic concepts...",
      emptyState: "Hi! I'm your LanguageBridge AI assistant. How can I help you today?",
      poweredBy: "Powered by",
      disclaimer: "via the Manus platform. Responses are AI-generated and may not always be accurate — please verify important information independently.",
    },
    // Admin review page
    admin: {
      title: "Review Courseware",
      subtitle: "Approve or reject submitted coursewares",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      approve: "Approve",
      reject: "Reject",
      noItems: "No items to review",
      editTitle: "Edit Courseware",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this courseware?",
    },
    // Common
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      notFound: "Page Not Found",
      notFoundMessage: "The page you're looking for doesn't exist.",
      goHome: "Go Home",
    },
  },
  zh: {
    // Navbar
    nav: {
      home: "首页",
      subjects: "科目",
      upload: "上传",
      aiAssistant: "AI 助手",
      review: "审核",
      adminLogin: "管理员登录",
      exitAdmin: "退出管理",
      adminMode: "管理员模式",
      adminModeActive: "管理员模式已激活",
      exitAdminMode: "退出管理员模式",
      login: "登录",
      logout: "退出登录",
    },
    // Home page
    home: {
      badge: "面向学生的开放协作平台",
      title: "The",
      titleBrand: "LanguageBridge",
      subtitle: "通过协作共享课件，帮助交换生更好地理解双语课程。",
      browseSubjects: "浏览科目",
      uploadCourseware: "上传课件",
      loginToUpload: "登录后上传",
      coursewares: "课件数量",
      subjects: "科目数量",
      community: "社区",
      open: "开放",
      exploreBySubject: "按科目浏览",
      exploreSubtitle: "按科目分类浏览课件",
      viewAll: "查看全部",
      recentlyUploaded: "最近上传",
      recentSubtitle: "来自社区的最新课件",
      noCoursewares: "暂无课件，成为第一个贡献者吧！",
      footer: "© 2026 The LanguageBridge. 保留所有权利。",
    },
    // Subjects page
    subjects: {
      title: "浏览科目",
      subtitle: "按科目查找课件",
      searchPlaceholder: "搜索课件...",
      allSubjects: "全部科目",
      noResults: "未找到课件",
      noResultsSubtitle: "请尝试调整搜索条件或筛选器。",
      uploaderLabel: "上传者",
      anonymous: "匿名",
      download: "下载",
      downloading: "下载中...",
      loginToDownload: "登录后下载",
      pending: "待审核",
      approved: "已通过",
      rejected: "已拒绝",
    },
    // Upload page
    upload: {
      title: "上传课件",
      subtitle: "与社区分享你的学习资料",
      titleEn: "标题（英文）",
      titleCn: "标题（中文）",
      titleEnPlaceholder: "请输入英文标题",
      titleCnPlaceholder: "请输入中文标题（可选）",
      descriptionEn: "描述（英文）",
      descriptionCn: "描述（中文）",
      descriptionEnPlaceholder: "用英文描述课件内容",
      descriptionCnPlaceholder: "用中文描述课件内容（可选）",
      subject: "科目",
      selectSubject: "选择科目",
      file: "文件",
      uploaderName: "你的姓名",
      uploaderNamePlaceholder: "请输入姓名（可选）",
      submit: "上传课件",
      submitting: "上传中...",
      successTitle: "上传成功",
      successMessage: "你的课件已提交审核。",
      uploadAnother: "继续上传",
    },
    // Courseware detail
    detail: {
      back: "返回",
      subject: "科目",
      uploadedBy: "上传者",
      anonymous: "匿名",
      uploadedOn: "上传时间",
      fileType: "文件类型",
      status: "状态",
      download: "下载",
      downloading: "下载中...",
      loginToDownload: "登录后下载",
      descriptionEn: "描述（英文）",
      descriptionCn: "描述（中文）",
      aiAssistant: "AI 助手",
      aiSubtitle: "针对本课件提问",
      aiPlaceholder: "询问关于本课件的问题...",
    },
    // AI Assistant page
    ai: {
      title: "AI 助手",
      subtitle: "LanguageBridge 的多语言学术助手",
      description: "你可以询问平台上的课件内容、物理、化学、生物或微积分等科目的学术概念，或如何使用 LanguageBridge。我支持任意语言——用你习惯的语言提问即可。",
      placeholder: "询问关于课件或学术概念的问题...",
      emptyState: "你好！我是 LanguageBridge AI 助手，有什么可以帮助你的？",
      poweredBy: "技术支持：",
      disclaimer: "（通过 Manus 平台接入）。AI 生成的回答可能存在误差，重要信息请自行核实。",
    },
    // Admin review page
    admin: {
      title: "审核课件",
      subtitle: "批准或拒绝提交的课件",
      pending: "待审核",
      approved: "已通过",
      rejected: "已拒绝",
      approve: "通过",
      reject: "拒绝",
      noItems: "暂无待审核内容",
      editTitle: "编辑课件",
      delete: "删除",
      confirmDelete: "确定要删除这个课件吗？",
    },
    // Common
    common: {
      loading: "加载中...",
      error: "出现错误",
      notFound: "页面未找到",
      notFoundMessage: "你访问的页面不存在。",
      goHome: "返回首页",
    },
  },
} as const;

// Use a recursive mapped type so both en and zh satisfy the same shape
type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Translations = DeepString<typeof translations.en>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("lb-language");
    return (saved === "zh" || saved === "en") ? saved : "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("lb-language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
