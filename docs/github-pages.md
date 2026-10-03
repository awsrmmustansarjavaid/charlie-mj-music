# GitHub Pages Deployment

## Manual branch deployment

This project is designed for GitHub Pages without a GitHub Actions workflow.

### Steps

1. Create a new GitHub repository.
2. Upload the repository contents.
3. Commit to `main`.
4. Open **Settings → Pages**.
5. Select **Deploy from a branch**.
6. Select branch `main`.
7. Select folder `/ (root)`.
8. Save.
9. Wait for GitHub Pages to publish the site.

## Why no workflow exists

The site consists of static files. A workflow is not necessary when GitHub Pages is configured to deploy directly from a branch.

## Relative paths

The application uses relative paths such as `css/style.css` and `js/app.js`, so it works when hosted under a repository path.

## Custom domain

A custom domain can be configured through GitHub Pages later. If you add one, update third-party OAuth redirect URIs to match the final HTTPS origin exactly.
