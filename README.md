# Puzzle Games Portfolio

A portfolio website showcasing interactive puzzle games, built with Eleventy for static generation and hosted on GitHub Pages. This project demonstrates web development skills in HTML, CSS, JavaScript, and static site tooling.

## Features
- **Playable Game Demo**: Embedded BlockBlast game with drag-and-drop mechanics.
- **Code Showcase**: Syntax-highlighted code snippets for review.
- **CV Sections**: About, Skills, Projects, Contact for professional presentation.
- **Responsive Design**: Mobile-friendly layout.
- **Free Hosting**: GitHub Pages integration.

## Prerequisites
- Node.js (v14+)
- npm or yarn
- Git
- GitHub account

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/blockblast-portfolio.git
cd blockblast-portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Local Development
Run Eleventy in development mode:
```bash
npx eleventy --serve
```
Open `http://localhost:8080` to view the site. Changes auto-reload.

### 4. Build for Production
Generate static files:
```bash
npx eleventy
```
Files output to `_site/` (or `docs/` if configured).

### 5. Deploy to GitHub Pages
- Push code to GitHub repo.
- Enable Pages in repo settings: Select `main` branch, set source to `docs/` folder.
- Optional: Use GitHub Actions for auto-build (add `.github/workflows/eleventy.yml`):
  ```yaml
  name: Build and Deploy
  on: [push]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: actions/setup-node@v2
          with:
            node-version: '16'
        - run: npm install
        - run: npx eleventy
        - uses: peaceiris/actions-gh-pages@v3
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: ./docs
  ```

### 6. Customise
- Edit templates in `src/`.
- Update game files in `src/games/blockblast/`.
- Modify data in `_data/`.

## Project Structure
```
blockblast-portfolio/
├── .eleventy.js          # Eleventy config
├── src/
│   ├── _includes/        # Layouts/partials
│   ├── games/            # Game assets
│   ├── index.njk         # Homepage
│   └── ...               # Other pages
├── _data/                # Site data (JSON/YAML)
├── docs/                 # Build output (for Pages)
└── README.md
```

## Technologies
- **Eleventy**: Static site generator.
- **Nunjucks**: Templating.
- **Prism.js**: Code highlighting.
- **CSS**: Custom styles with Grid/Flexbox.

## Contributing
Fork, make changes, submit PRs. Follow British English for comments/names.

## License
MIT License. See LICENSE for details.

## Live Demo
[View on GitHub Pages](https://yourusername.github.io/blockblast-portfolio/)