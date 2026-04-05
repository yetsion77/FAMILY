@echo off
echo מנקה קבצים מיותרים בגיטהאב...
git rm -r --cached node_modules
git add .
git commit -m "Add gitignore and remove node_modules"
git push
echo סיימנו! הקבצים המיותרים נמחקו, והתיקון עודכן.
pause
