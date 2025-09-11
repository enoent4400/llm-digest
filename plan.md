 Overview

    Technology Stack

    - React Flow (XyFlow) for node-based visualizations (mind-map)
    - Existing shadcn/ui components for standard UI elements
    - Custom React components for timeline and structured content visualizations

    Implementation Plan

    1. Action Plan Visualization

    - Library: shadcn/ui with custom styling
    - Key Features:
      - Kanban-style board with phases (Planning, Implementation, etc.)
      - Priority-based color coding
      - Dependency visualization with connecting lines
      - Timeline view showing immediate/short-term/long-term actions
      - Progress tracking indicators
    - Components:
      - ActionPlanBoard.tsx - Main container
      - ActionCard.tsx - Individual action items
      - PhaseColumn.tsx - Phase grouping
      - DependencyLines.tsx - Visual connections

    2. FAQ Visualization

    - Library: shadcn/ui
    - Key Features:
      - Collapsible accordion for Q&A pairs
      - Category-based filtering
      - Search functionality
      - Importance indicators
      - Copy individual Q&A functionality
    - Components:
      - FAQAccordion.tsx - Main container
      - QuestionItem.tsx - Individual Q&A
      - CategoryFilter.tsx - Filter by categories

    3. Mind Map Visualization

    - Library: React Flow with custom node types
    - Key Features:
      - Hierarchical tree layout (using dagre)
      - Expandable/collapsible branches
      - Zoom and pan controls
      - Export to image functionality
    - Components:
      - MindMapFlow.tsx - React Flow container
      - MindMapNode.tsx - Custom node component
      - MindMapControls.tsx - Zoom/pan/export controls


    4. Blog Post Visualization

    - Library: Custom React component with rich text rendering
    - Key Features:
      - Article-style layout
      - Markdown rendering for content
      - Table of contents sidebar
      - Code syntax highlighting
      - SEO metadata display
      - Reading time indicator
      - Copy entire post functionality
    - Components:
      - BlogPostView.tsx - Main article container
      - TableOfContents.tsx - Navigation sidebar
      - BlogSection.tsx - Individual sections
      - SEOPreview.tsx - Metadata preview

    Implementation Order

    1. FAQ (simplest, uses existing accordion patterns)
    2. Action Plan (custom component, moderate complexity)
    3. Blog Post (custom component, moderate complexity)
    4. Mind Map (React Flow, higher complexity)

    Shared Components

    - VisualizationWrapper.tsx - Common wrapper with export/copy functionality
    - VisualizationControls.tsx - Zoom, filter, export controls
    - EmptyState.tsx - When no data available
    - LoadingState.tsx - While processing

    File Structure

    components/visualizations/
    ├── action-plan/
    │   ├── index.ts
    │   ├── ActionPlanBoard.tsx
    │   └── components/...
    ├── faq/
    │   ├── index.ts
    │   ├── FAQAccordion.tsx
    │   └── components/...
    ├── mind-map/
    │   ├── index.ts
    │   ├── MindMapFlow.tsx
    │   └── components/...
    ├── blog-post/
    │   ├── index.ts
    │   ├── BlogPostView.tsx
    │   └── components/...
    └── shared/
        └── ... (shared components)

    Integration Points

    - Update digest-client.tsx to import and render new visualizations
    - Each visualization receives databaseDigest prop
    - Use existing type definitions from types/digest.ts
    - Follow existing patterns from ExecutiveSummary and SimpleCodeBlocksDigest

    Testing Strategy

    - Unit tests for data transformation
    - Visual regression tests for each visualization
    - Accessibility testing for interactive elements
    - Performance testing for large datasets

⏺ Todos
     ☐ Implement FAQ visualization with accordion
     ☐ Implement Action Plan visualization with kanban-style board
     ☐ Update digest-client.tsx to render new visualizations
     ☐ Implement Blog Post visualization with article layout
     ☐ Implement Mind Map visualization with React Flow
