#!/bin/bash
set -a
source /var/www/australian-boundaries.builtbyhumberto.tech/server/.env
set +a
exec node dist/index.js
