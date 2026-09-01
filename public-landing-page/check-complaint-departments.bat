@echo off
cd backend
node -e "const {pool} = require('./src/config/database'); pool.query('SELECT id, title, assigned_department_id, status FROM complaints LIMIT 10').then(r => {console.log('Complaints:', r.rows); pool.end();}).catch(e => {console.error(e); pool.end();});"
