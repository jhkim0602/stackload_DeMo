import { create } from 'zustand';

// --- Advanced Kanban Types ---

export interface CustomFieldConfig {
  id: string;
  projectId: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'person';
  options?: string[];
}

export interface TaskFieldValue {
  fieldId: string;
  value: any;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}


export type TaskStatus = string;

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: string;
  dueDate?: string;
  docRef?: string;
  customFieldValues: TaskFieldValue[];
  comments: Comment[];
  history: ActivityLog[];

  tags?: string[]; // Array of Tag IDs
  subtasks?: { id: string; title: string; completed: boolean }[];
}

// --- Chat & System Messages (New) ---

export interface ChannelMessage {
  id: string;
  channelId: string; // 'general', 'dev', etc.
  senderId: string; // 'system' for automated messages
  type: 'user' | 'system';
  content: string;
  timestamp: string;
  metadata?: any; // For rich links (e.g., { linkType: 'task', linkId: 't-1' })
}

// --- Personal Zone Types ---

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'assignment' | 'update';
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface PrivateDoc {
  id: string;
  userId: string;
  title: string;
  content: any[];
  updatedAt: string;
}

// --- Basic Project Types ---

export type ProjectType = 'hackathon' | 'study' | 'side-project';
export type ProjectStatus = 'live' | 'completed' | 'archived';

export interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'member' | 'viewer';
  online: boolean;
}

// --- Board View Types (New) ---

export interface ViewColumn {
  id: string; // Unique ID for the column in this view
  title: string; // Display title
  statusId: string; // Maps to Task.status
  color?: string;
}

export interface BoardView {
  id: string;
  projectId: string;
  name: string;
  type: 'kanban' | 'list' | 'calendar';
  groupBy: 'status' | 'assignee';
  columns: ViewColumn[]; // Only relevant if groupBy === 'status'
  cardProperties?: string[]; // Order of visible properties e.g. ['badges', 'title', 'tags', 'assignee', 'dueDate']
  filter?: {
     tags?: string[];
     assignee?: string[];
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  lastActive: string;
  members: ProjectMember[];
  dDay?: string;
  externalLink?: { title: string; url: string };
  customFields: CustomFieldConfig[];
  // columns: { id: string; title: string }[]; // DEPRECATED -> moved to BoardView
  views: BoardView[];
}

export interface Doc {
  id: string;
  projectId: string;
  title: string;
  content: any[];
  linkedTaskIds?: string[];
  updatedAt: string;
}

// --- Mock Data ---

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p-1',
    title: 'Sumsung SDS 해커톤 팀',
    description: '알고리즘 트랙 본선 준비 및 API 연동 프로젝트',
    type: 'hackathon',
    status: 'live',
    lastActive: '2시간 전',
    members: [
      { id: 'u1', name: 'Junghwan', avatar: 'J', role: 'leader', online: true },
      { id: 'u2', name: 'Frontend', avatar: 'F', role: 'member', online: true },
      { id: 'u3', name: 'Designer', avatar: 'D', role: 'member', online: false },
    ],
    dDay: '2025-02-15',
    externalLink: { title: 'Samsung SDS 해커톤 공지', url: 'https://samsungsds.com/hackathon' },
    customFields: [
      { id: 'cf-1', projectId: 'p-1', name: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      { id: 'cf-2', projectId: 'p-1', name: 'Story Points', type: 'number' },
    ],
    views: [
       {
          id: 'v-1', projectId: 'p-1', name: '메인 보드', type: 'kanban', groupBy: 'status',
          columns: [
             { id: 'col-1', title: '할 일', statusId: 'todo', color: 'bg-gray-500' },
             { id: 'col-2', title: '진행 중', statusId: 'in-progress', color: 'bg-blue-500' },
             { id: 'col-3', title: '완료', statusId: 'done', color: 'bg-green-500' }
          ]
       },
       {
          id: 'v-1-2', projectId: 'p-1', name: '스프린트 1', type: 'kanban', groupBy: 'status',
          columns: [
             { id: 'col-1-2', title: '백로그', statusId: 'todo', color: 'bg-slate-500' },
             { id: 'col-2-2', title: '진행 중', statusId: 'in-progress', color: 'bg-emerald-500' }
          ]
       }
    ]
  },
  {
    id: 'p-2', // simplified for brevity
    title: 'StackLoad 사이드 프로젝트',
    description: '개발자 커리어 플랫폼 클론 코딩',
    type: 'side-project',
    status: 'live',
    lastActive: '5시간 전',
    members: [
      { id: 'u1', name: 'Junghwan', avatar: 'J', role: 'leader', online: true },
      { id: 'u2', name: 'Frontend', avatar: 'F', role: 'member', online: false },
    ],
    customFields: [],
    views: [
       {
          id: 'v-2', projectId: 'p-2', name: 'Task Board', type: 'kanban', groupBy: 'status',
          columns: [
             { id: 'col-1', title: 'To Do', statusId: 'todo' },
             { id: 'col-2', title: 'Done', statusId: 'done' }
          ]
       }
    ]
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1', projectId: 'p-1', title: '기획서 초안 작성', status: 'done', assignee: 'Junghwan', dueDate: '2025-01-10',
    customFieldValues: [{ fieldId: 'cf-1', value: 'High' }], comments: [], history: []
  },
  {
    id: 't-2', projectId: 'p-1', title: 'API 명세서 정리', status: 'in-progress', assignee: 'Junghwan', dueDate: '2025-01-12', docRef: 'd-1',
    customFieldValues: [{ fieldId: 'cf-1', value: 'High' }, { fieldId: 'cf-2', value: 5 }],
    comments: [{ id: 'c-1', authorId: 'u2', content: 'REST API 구조 확인해주세요.', createdAt: '2025-01-11T10:00:00Z' }],
    history: [{ id: 'h-1', userId: 'u1', action: 'moved to In Progress', timestamp: '2025-01-11T09:00:00Z' }]
  },
  {
    id: 't-3', projectId: 'p-1', title: '로그인 페이지 UI 구현', status: 'todo', assignee: 'Frontend', dueDate: '2025-01-15',
    customFieldValues: [{ fieldId: 'cf-1', value: 'Medium' }], comments: [], history: []
  },
];

const INITIAL_DOCS: Doc[] = [
  { id: 'd-1', projectId: 'p-1', title: 'API Specification v1.0', updatedAt: '2025-01-05', content: [{ type: 'paragraph', content: 'Specs...' }] },
  // Add some templates to existing project for demo
  { id: 'd-2', projectId: 'p-1', title: '📝 1. Product Requirements Document (PRD)', updatedAt: '2025-01-06', content: [{ type: 'heading', content: 'Product Requirements Document' }, { type: 'paragraph', content: 'This is a template for PRD.' }] },
  { id: 'd-3', projectId: 'p-1', title: '📅 2. Project Roadmap', updatedAt: '2025-01-06', content: [{ type: 'heading', content: 'Project Roadmap' }] },
  { id: 'd-4', projectId: 'p-1', title: '🏗️ 3. Tech Architecture', updatedAt: '2025-01-06', content: [{ type: 'heading', content: 'System Architecture' }] },
  { id: 'd-5', projectId: 'p-1', title: '🤝 4. Team Ground Rules', updatedAt: '2025-01-06', content: [{ type: 'heading', content: 'Team Ground Rules' }] }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', userId: 'u1', type: 'mention', message: 'Frontend mentioned you in "API Spec"', read: false, timestamp: '10 mins ago', link: '/workspace/p-1' },
];

const INITIAL_PRIVATE_DOCS: PrivateDoc[] = [
  { id: 'pd-1', userId: 'u1', title: 'My Scratchpad', content: [], updatedAt: 'Today' }
];

const INITIAL_MESSAGES: ChannelMessage[] = [
  { id: 'm-1', channelId: 'general', senderId: 'u1', type: 'user', content: 'Welcome to the team chat!', timestamp: '10:00 AM' },
  { id: 'm-2', channelId: 'general', senderId: 'u2', type: 'user', content: 'Thanks! Excited to work on this.', timestamp: '10:05 AM' },
];

// --- Template Generators ---

const generateTemplates = (projectId: string): Doc[] => [
  {
    id: `d-${Date.now()}-1`,
    projectId,
    title: '📝 1. Product Requirements Document (PRD)',
    updatedAt: new Date().toISOString(),
    content: [
      { type: 'heading', content: '🚀 Product Requirements Document', props: { level: 1 } },
      { type: 'paragraph', content: '프로젝트의 핵심 목표와 기능을 정의하는 문서입니다.' },
      { type: 'heading', content: '1. 배경 및 목적 (Background & Goals)', props: { level: 2 } },
      { type: 'bulletListItem', content: '문제 정의: ' },
      { type: 'bulletListItem', content: '해결 방안: ' },
      { type: 'heading', content: '2. 타겟 유저 (Target User)', props: { level: 2 } },
      { type: 'bulletListItem', content: '페르소나 A: ' },
      { type: 'heading', content: '3. 핵심 기능 (Core Features - MVP)', props: { level: 2 } },
      { type: 'checkListItem', content: '회원가입/로그인' },
      { type: 'checkListItem', content: '메인 대시보드' },
    ]
  },
  {
    id: `d-${Date.now()}-2`,
    projectId,
    title: '📅 2. Project Roadmap',
    updatedAt: new Date().toISOString(),
    content: [
      { type: 'heading', content: '📅 Project Schedule & Milestones', props: { level: 1 } },
      { type: 'heading', content: '1주차: 기획 및 설계', props: { level: 2 } },
      { type: 'bulletListItem', content: 'Day 1: 아이디어 확정' },
      { type: 'bulletListItem', content: 'Day 2: 와이어프레임 & ERD 설계' },
      { type: 'heading', content: '2주차: 핵심 기능 개발', props: { level: 2 } },
      { type: 'bulletListItem', content: 'Day 1: 개발 환경 세팅' },
    ]
  },
  {
    id: `d-${Date.now()}-3`,
    projectId,
    title: '🏗️ 3. Tech Architecture',
    updatedAt: new Date().toISOString(),
    content: [
      { type: 'heading', content: '🏗️ Technical Architecture Spec', props: { level: 1 } },
      { type: 'heading', content: 'Frontend Stack', props: { level: 2 } },
      { type: 'bulletListItem', content: 'Framework: Next.js 14' },
      { type: 'bulletListItem', content: 'Styling: Tailwind CSS' },
      { type: 'heading', content: 'Backend Stack', props: { level: 2 } },
      { type: 'bulletListItem', content: 'Language: Python / Node.js' },
      { type: 'bulletListItem', content: 'Database: Supabase (PostgreSQL)' },
    ]
  },
  {
    id: `d-${Date.now()}-4`,
    projectId,
    title: '🤝 4. Team Ground Rules',
    updatedAt: new Date().toISOString(),
    content: [
      { type: 'heading', content: '🤝 Team Ground Rules', props: { level: 1 } },
      { type: 'heading', content: 'Communication', props: { level: 2 } },
      { type: 'bulletListItem', content: '모든 회의록은 Docs에 남긴다.' },
      { type: 'bulletListItem', content: 'Slack 응답은 1시간 이내에.' },
      { type: 'heading', content: 'Git Convention', props: { level: 2 } },
      { type: 'bulletListItem', content: 'feat: 새로운 기능 추가' },
      { type: 'bulletListItem', content: 'fix: 버그 수정' },
    ]
  }
];

// --- Store ---

export interface Tag {
  id: string;
  name: string;
  color: string; // Hex or Tailwind class
}

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-1', name: '긴급', color: 'bg-red-200/60' },
  { id: 'tag-2', name: '디자인', color: 'bg-purple-200/60' },
  { id: 'tag-3', name: '버그', color: 'bg-orange-200/60' },
];

export interface WorkspaceStore {
  projects: Project[];
  tasks: Task[];
  docs: Doc[];
  notifications: Notification[];
  privateDocs: PrivateDoc[];
  messages: ChannelMessage[];
  tags: Tag[];
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;

  // Actions
  createProject: (project: Omit<Project, 'id' | 'lastActive' | 'customFields' | 'views'>) => void;

  // Task Actions (with Side-Effects)
  createTask: (task: Omit<Task, 'id' | 'comments' | 'history' | 'subtasks'>) => string | null;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addComment: (taskId: string, content: string) => void;

  // Doc Actions
  createDoc: (doc: Omit<Doc, 'id' | 'updatedAt'>) => void;
  updateDoc: (docId: string, content: any[]) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  addNotification: (noti: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;

  // Chat Actions
  sendMessage: (channelId: string, content: string, senderId?: string, type?: 'user' | 'system') => void;

  // View & Column Actions
  addColumnToView: (viewId: string, title: string, statusId?: string) => void;
  updateColumnInView: (viewId: string, columnId: string, updates: { title?: string, color?: string }) => void;
  deleteColumnFromView: (viewId: string, columnId: string) => void;
  renameColumnInView: (viewId: string, columnId: string, newTitle: string) => void;
  moveColumnInView: (viewId: string, fromIndex: number, toIndex: number) => void;
  updateViewCardProperties: (viewId: string, properties: string[]) => void;

  // Tag Actions
  createTag: (name: string, color: string) => void;
  updateTag: (tagId: string, updates: { name?: string, color?: string }) => void;
  deleteTag: (tagId: string) => void;
  reorderTags: (fromIndex: number, toIndex: number) => void;
  addTagToTask: (taskId: string, tagId: string) => void;
  removeTagFromTask: (taskId: string, tagId: string) => void;
  deleteTask: (taskId: string) => void;
  reorderTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  projects: MOCK_PROJECTS,
  tasks: INITIAL_TASKS,
  docs: INITIAL_DOCS,
  notifications: INITIAL_NOTIFICATIONS,
  privateDocs: INITIAL_PRIVATE_DOCS,
  messages: INITIAL_MESSAGES,
  tags: INITIAL_TAGS,
  activeTaskId: null,
  setActiveTaskId: (id) => set({ activeTaskId: id }),

  createProject: (project) => set((state) => {
    const newProjectId = `p-${Date.now()}`;
    const newProject: Project = {
       ...project,
       id: newProjectId,
       lastActive: '방금 전',
       customFields: [],
       views: [{
          id: `v-${Date.now()}`,
          projectId: newProjectId,
          name: '메인 보드',
          type: 'kanban',
          groupBy: 'status',
          columns: [
             { id: 'todo', title: '할 일', statusId: 'todo' },
             { id: 'done', title: '완료', statusId: 'done' }
          ]
       }]
    };

    const newDocs = generateTemplates(newProjectId);

    return {
      projects: [...state.projects, newProject],
      docs: [...state.docs, ...newDocs]
    };
  }),

  createTask: (task) => {
    const currentTasks = get().tasks;
    const projectTaskCount = currentTasks.filter(t => t.projectId === task.projectId).length;

    if (projectTaskCount >= 500) {
      alert("⚠️ 한 프로젝트당 최대 500개의 태스크만 생성할 수 있습니다. (성능 보호)");
      return null;
    }

    const newTaskId = `t-${Date.now()}`;
    const newTask: Task = { ...task, id: newTaskId, comments: [], history: [] };

    set((state) => ({
      tasks: [...state.tasks, newTask]
    }));
    // Side Effect: Notify if assigned
    if (task.assignee === 'Junghwan') {
       get().addNotification({ userId: 'u1', type: 'assignment', message: `You were assigned to "${task.title}"`, link: '#' });
    }
    // Side Effect: System Message
    get().sendMessage('general', `New task created: **${task.title}**`, 'system', 'system');

    return newTaskId;
  },

  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t)
    }));
    const task = get().tasks.find(t => t.id === taskId);
    if (task) {
       // Side Effect: System Message
       get().sendMessage('general', `Task **${task.title}** moved to **${status}**`, 'system', 'system');
       // Side Effect: Activity Log (Mock)
       get().updateTask(taskId, { history: [...task.history, { id: `h-${Date.now()}`, userId: 'u1', action: `moved to ${status}`, timestamp: new Date().toISOString() }] });
    }
  },

  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
    }));
    // Check for specific updates to trigger side effects
    if (updates.assignee === 'Junghwan') {
       const task = get().tasks.find(t => t.id === taskId);
       get().addNotification({ userId: 'u1', type: 'assignment', message: `You were assigned to "${task?.title}"`, link: '#' });
       get().sendMessage('general', `Task **${task?.title}** assigned to **Junghwan**`, 'system', 'system');
    }
  },

  addComment: (taskId, content) => set((state) => ({
    tasks: state.tasks.map(t => {
       if (t.id === taskId) {
         return { ...t, comments: [...t.comments, { id: `c-${Date.now()}`, authorId: 'u1', content, createdAt: new Date().toISOString() }] };
       }
       return t;
    })
  })),



  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),

  createDoc: (doc) => set((state) => ({
    docs: [...state.docs, { ...doc, id: `d-${Date.now()}`, updatedAt: new Date().toISOString() }]
  })),

  updateDoc: (docId, content) => set((state) => ({
    docs: state.docs.map((d) => d.id === docId ? { ...d, content, updatedAt: new Date().toISOString() } : d)
  })),

  markNotificationRead: (id) => set((state) => ({
     notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),

  addNotification: (noti) => set((state) => ({
     notifications: [{ ...noti, id: `n-${Date.now()}`, timestamp: 'Just now', read: false }, ...state.notifications]
  })),

  sendMessage: (channelId, content, senderId = 'u1', type = 'user') => set((state) => ({
     messages: [...state.messages, {
        id: `m-${Date.now()}`,
        channelId,
        senderId,
        type,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
     }]
  })),

  addColumnToView: (viewId, title, statusId) => set((state) => ({
     projects: state.projects.map(p => {
         const viewIndex = p.views.findIndex(v => v.id === viewId);
         if (viewIndex > -1) {
            const newViews = [...p.views];
            const targetView = newViews[viewIndex];
            const newStatusId = statusId || title.toLowerCase().replace(/\s+/g, '-');
            const newCol: ViewColumn = { id: `col-${Date.now()}`, title, statusId: newStatusId };

            newViews[viewIndex] = {
               ...targetView,
               columns: [...targetView.columns, newCol]
            };
            return { ...p, views: newViews };
         }
         return p;
     })
  })),

  updateColumnInView: (viewId, columnId, updates) => set((state) => ({
     projects: state.projects.map(p => {
        const viewIndex = p.views.findIndex(v => v.id === viewId);
        if (viewIndex > -1) {
           const newViews = [...p.views];
           newViews[viewIndex].columns = newViews[viewIndex].columns.map(c =>
              c.id === columnId ? { ...c, ...updates } : c
           );
           return { ...p, views: newViews };
        }
        return p;
     })
  })),

  deleteColumnFromView: (viewId, columnId) => set((state) => ({
     projects: state.projects.map(p => {
         const viewIndex = p.views.findIndex(v => v.id === viewId);
         if (viewIndex > -1) {
            const newViews = [...p.views];
            newViews[viewIndex].columns = newViews[viewIndex].columns.filter(c => c.id !== columnId);
            return { ...p, views: newViews };
         }
         return p;
     })
  })),

  renameColumnInView: (viewId, columnId, newTitle) => set((state) => ({
     projects: state.projects.map(p => {
         const viewIndex = p.views.findIndex(v => v.id === viewId);
         if (viewIndex > -1) {
            const newViews = [...p.views];
            newViews[viewIndex].columns = newViews[viewIndex].columns.map(c =>
               c.id === columnId ? { ...c, title: newTitle } : c
            );
            return { ...p, views: newViews };
         }
         return p;
     })
  })),

  moveColumnInView: (viewId, fromIndex, toIndex) => set((state) => ({
     projects: state.projects.map(p => {
        const viewIndex = p.views.findIndex(v => v.id === viewId);
        if (viewIndex > -1) {
           const newViews = [...p.views];
           const columns = [...newViews[viewIndex].columns];
           const [movedCol] = columns.splice(fromIndex, 1);
           columns.splice(toIndex, 0, movedCol);

           newViews[viewIndex] = { ...newViews[viewIndex], columns };
           return { ...p, views: newViews };
        }
        return p;
     })
  })),

  updateViewCardProperties: (viewId, properties) => set((state) => ({
      projects: state.projects.map(p => {
         const viewIndex = p.views.findIndex(v => v.id === viewId);
         if (viewIndex > -1) {
             const newViews = [...p.views];
             newViews[viewIndex] = { ...newViews[viewIndex], cardProperties: properties };
             return { ...p, views: newViews };
         }
         return p;
      })
  })),

  // --- Tag Actions ---
  createTag: (name, color) => set((state) => {
    const newTag = { id: `tag-${Date.now()}`, name, color };
    return { tags: [...state.tags, newTag] };
  }),

  deleteTag: (tagId) => set((state) => ({
    tags: state.tags.filter(t => t.id !== tagId),
    tasks: state.tasks.map(t => ({ ...t, tags: t.tags?.filter(id => id !== tagId) }))
  })),

  updateTag: (tagId, updates) => set((state) => ({
    tags: state.tags.map(t => t.id === tagId ? { ...t, ...updates } : t)
  })),

  reorderTags: (fromIndex, toIndex) => set((state) => {
    const newTags = [...state.tags];
    const [movedTag] = newTags.splice(fromIndex, 1);
    newTags.splice(toIndex, 0, movedTag);
    return { tags: newTags };
  }),

  addTagToTask: (taskId, tagId) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId) {
        const currentTags = t.tags || [];
        if (currentTags.includes(tagId)) return t;
        return { ...t, tags: [...currentTags, tagId] };
      }
      return t;
    })
  })),

  removeTagFromTask: (taskId, tagId) => set((state) => ({
    tasks: state.tasks.map(t => {
       if (t.id === taskId) {
          return { ...t, tags: t.tags?.filter(id => id !== tagId) };
       }
       return t;
    })
  })),

  reorderTask: (taskId, newStatus, newIndex) => set((state) => {
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return state;

      const newTasks = [...state.tasks];
      const [movedTask] = newTasks.splice(taskIndex, 1);

      // Update status
      movedTask.status = newStatus;

      // Calculate insertion index
      // We need to find where to insert in the GLOBAL tasks array to match the visual order in the COLUMN.
      // This is tricky because the global array is mixed.
      // Strategy:
      // 1. Filter tasks by the newStatus (target column tasks).
      // 2. Insert into that filtered array at newIndex.
      // 3. Reconstruct global array: Keep other statuses as is, replace newStatus tasks with the new order.

      // Actually, for a simple mock, we can just filter out tasks of newStatus, then splice them back in?
      // No, that changes order of other tasks if not careful.

      // Let's do this:
      // Get all tasks that are NOT in the target status.
      const otherTasks = newTasks.filter(t => t.status !== newStatus);
      // Get all tasks IN the target status (excluding the moved one, which we already removed from newTasks if it was same status, or just removed from global).
      // Wait, splice removed it from global.
      // So newTasks now lacks the movedTask.
      const targetTasks = newTasks.filter(t => t.status === newStatus);

      // Insert movedTask into targetTasks at newIndex
      targetTasks.splice(newIndex, 0, movedTask);

      // Reassemble:
      // We might lose original interleaving of other statuses but that doesn't matter for Kanban view.
      // But we should probably preserve order of distinct statuses if possible?
      // Simpler: Just concat everything.
      return { tasks: [...otherTasks, ...targetTasks] };
  }),
}));
