# 🚀 Prisma Editor - Visual Prisma Schema Management

[![GitHub Stars](https://img.shields.io/github/stars/asfand-dev/prisma-editor?style=social)](https://github.com/asfand-dev/prisma-editor)
[![GitHub Forks](https://img.shields.io/github/forks/asfand-dev/prisma-editor?style=social)](https://github.com/asfand-dev/prisma-editor)
[![License](https://img.shields.io/github/license/asfand-dev/prisma-editor)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/asfand-dev/prisma-editor/pulls)
[![Built with React](https://img.shields.io/badge/Built%20with-React-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## ✨ Overview

**Prisma Editor** is a comprehensive and intuitive web-based editor designed to empower developers to visually create, edit, and manage Prisma ORM schemas. Instead of manually writing Prisma Schema Language (PSL) code, you can define database models, relations, and configurations through a user-friendly interface.

With Prisma Editor, you can easily import existing schemas for visualization and modification, then export your work back to a standard schema.prisma file. Built with responsiveness in mind, it integrates seamlessly into existing dashboards or workflows, making database modeling more accessible and efficient.

## 🚀 Use in Your Prisma Project

Run Prisma Editor directly within your existing Prisma project to visually edit your schema:

```bash
npx prisma-editor
```

This command will:
- Start a local server and load your project's `prisma/schema.prisma` file
- Open the editor UI in your browser: http://localhost:5566
- Allow you to make visual changes
- Save changes directly back to your project when you click "Save Schema"

This provides a convenient way to visually manage your Prisma schema without leaving your project context.

## ⚙️ Key Features

### Visual Schema Editing

- **Models & Fields:** Create, edit, and delete models with full control over fields, types, attributes, and modifiers
- **Relations:** Intuitively define and manage relationships between models with visual tools
- **Enums & Blocks:** Manage enums, datasource configuration, and generator blocks
- **Advanced Features:** Configure indexes, unique constraints, and all standard Prisma attributes

### Schema File Handling

- **Import:** Load existing schema.prisma files to visualize and modify
- **Export:** Generate and download schema.prisma files from your visual design

### ERD Visualization

- **Visual Diagram:** Generate an Entity Relationship Diagram of your schema
- **Relationship Overview:** Clearly see and understand model connections

### Intuitive Interface

- **Responsive Design:** Optimal experience on desktop, tablet, and mobile devices
- **Clear Navigation:** Organized sidebar with models and enums clearly indicated
- **Dynamic Controls:** Context-aware input fields and dropdowns
- **Code Previews:** See generated Prisma schema code for selected elements

## 🏗️ Architecture

Prisma Editor follows a modern frontend architecture with:

- **Left Sidebar:** Navigation for models, enums, and configuration, with action buttons
- **Main Editor Area:** Dynamic forms and controls for editing schema elements
- **ERD View:** Visual diagram rendering for schema visualization
- **State Management:** Comprehensive schema data structure management
- **Import/Export Logic:** Parsing and generating .prisma files with support for both browser and API modes

## 🚀 Getting Started

To run Prisma Editor locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/asfand-dev/prisma-editor.git
   cd prisma-editor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   This will start the application on a local development server, typically at `http://localhost:3000`.

4. **Building the project:**
   ```bash
   # Build the standard version
   npm run build

   # Build the version for npx usage
   npm run build-for-npx
   ```

## ✍️ Usage

1. **Navigate the Left Sidebar:** Switch between models, enums, and configuration
2. **Add/Select Elements:** Create new models or enums and select existing ones to edit
3. **Edit Details:** Configure properties, fields, relations, and attributes
4. **Visualize:** Use the ERD and Preview features to see your schema visually and as code
5. **Save/Load:** Import existing schemas or export your current design

## 💡 Contributing

We welcome contributions from the community! If you'd like to contribute to Prisma Editor, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure proper testing.
4. Submit a pull request with a clear description of your changes.

Please adhere to the project's coding standards and best practices.

## 💬 Support

If you encounter any issues or have suggestions for improvement, please feel free to:

- Open an issue on GitHub: [https://github.com/asfand-dev/prisma-editor/issues](https://github.com/asfand-dev/prisma-editor/issues)
- Reach out via asfand.dev@gmail.com

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as per the terms of the license.
