# GitHub Setup Without Actions

GitHub is only the source repository in this version.

```bash
git init
git add .
git commit -m "Initial Charlie MJ Music release"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

There is intentionally no GitHub Actions workflow. Keep `.env` untracked and use `.env.example` as the configuration template.
