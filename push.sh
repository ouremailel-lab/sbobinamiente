#!/bin/bash
git add .
git commit -m "${1:-Aggiornamenti automatici}"
git push origin main
