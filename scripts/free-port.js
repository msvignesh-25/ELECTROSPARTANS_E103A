// Node.js script to free up port 3000
const { execSync } = require('child_process');
const os = require('os');

const port = process.argv[2] || 3000;
const platform = os.platform();

try {
  if (platform === 'win32') {
    // Windows
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)$/);
        if (match) {
          pids.add(match[1]);
        }
      });
      
      if (pids.size > 0) {
        console.log(`Found ${pids.size} process(es) using port ${port}. Terminating...`);
        pids.forEach(pid => {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`✓ Terminated process ${pid}`);
          } catch (e) {
            console.log(`✗ Failed to terminate process ${pid}`);
          }
        });
        console.log(`✓ Port ${port} is now free.`);
      } else {
        console.log(`✓ Port ${port} is already free.`);
      }
    } catch (e) {
      // No process found using the port
      console.log(`✓ Port ${port} is already free.`);
    }
  } else {
    // Linux/Mac
    try {
      const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
      const pids = result.trim().split('\n').filter(Boolean);
      
      if (pids.length > 0) {
        console.log(`Found ${pids.length} process(es) using port ${port}. Terminating...`);
        pids.forEach(pid => {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`✓ Terminated process ${pid}`);
          } catch (e) {
            console.log(`✗ Failed to terminate process ${pid}`);
          }
        });
        console.log(`✓ Port ${port} is now free.`);
      }
    } catch (e) {
      console.log(`✓ Port ${port} is already free.`);
    }
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
