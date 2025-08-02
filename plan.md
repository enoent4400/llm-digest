 Overview

    Implement 7 new visualization types for the LLM Digest project. Currently have executive-summary and code-organization working. Need to
    add: action-plan, faq, mind-map, knowledge-graph, gantt-chart, decision-tree, and blog-post.

    Technology Stack

    - React Flow (XyFlow) for node-based visualizations (mind-map, knowledge-graph, decision-tree)
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

    4. Knowledge Graph Visualization

    - Library: React Flow with force-directed layout
    - Key Features:
      - Force-directed graph layout (using d3-force)
      - Node clustering by category
      - Edge types with different styles
      - Node importance sizing
      - Interactive tooltips
      - Filter by entity type
    - Components:
      - KnowledgeGraphFlow.tsx - React Flow container
      - EntityNode.tsx - Custom node for entities
      - RelationshipEdge.tsx - Custom edge styling
      - GraphFilters.tsx - Entity type filters

    5. Gantt Chart Visualization

    - Library: Custom React component or wrapped Frappe Gantt
    - Key Features:
      - Horizontal timeline with tasks
      - Phase grouping with swim lanes
      - Dependency arrows
      - Progress indicators
      - Zoom controls for timeline
      - Task details on hover
    - Components:
      - GanttChart.tsx - Main timeline container
      - GanttTask.tsx - Individual task bars
      - GanttHeader.tsx - Timeline header
      - TaskTooltip.tsx - Hover details

    6. Decision Tree Visualization

    - Library: React Flow with tree layout
    - Key Features:
      - Top-to-bottom tree layout
      - Decision nodes with Yes/No branches
      - Outcome nodes with different styling
      - Path highlighting
      - Confidence level indicators
      - Export decision paths
    - Components:
      - DecisionTreeFlow.tsx - React Flow container
      - DecisionNode.tsx - Question nodes
      - OutcomeNode.tsx - Result nodes
      - PathHighlight.tsx - Highlight selected paths

    7. Blog Post Visualization

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
    4. Gantt Chart (custom timeline, moderate complexity)
    5. Mind Map (React Flow, higher complexity)
    6. Knowledge Graph (React Flow with physics, higher complexity)
    7. Decision Tree (React Flow with custom logic, highest complexity)

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
    ├── knowledge-graph/
    │   ├── index.ts
    │   ├── KnowledgeGraphFlow.tsx
    │   └── components/...
    ├── gantt-chart/
    │   ├── index.ts
    │   ├── GanttChart.tsx
    │   └── components/...
    ├── decision-tree/
    │   ├── index.ts
    │   ├── DecisionTreeFlow.tsx
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
     ☐ Implement Gantt Chart visualization with timeline
     ☐ Implement Mind Map visualization with React Flow
     ☐ Implement Knowledge Graph visualization with React Flow
     ☐ Implement Decision Tree visualization with React Flow
