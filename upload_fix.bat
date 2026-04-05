@echo off
echo מתקן את הגדרות האזור של פיירבייס...
git add .
git commit -m "Fix Firebase databaseURL region and favicon path"
git push
echo סיימנו! התיקון עלה לשרת.
pause
