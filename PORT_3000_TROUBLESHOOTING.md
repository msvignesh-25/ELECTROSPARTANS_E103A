# Port 3000 Already in Use - Troubleshooting Guide

## Why This Error Occurs

The error `EADDRINUSE: address already in use :::3000` happens when:
1. **Previous server instance is still running** - You started the server before and didn't properly stop it
2. **Another application is using port 3000** - Another Node.js app, React dev server, or any other service
3. **Background processes** - The server was started in the background and is still running

## Quick Solutions

### Option 1: Use the Auto-Fix Script (Recommended)
```bash
npm run start:clean
```
This automatically frees port 3000 before starting the server.

### Option 2: Manually Free the Port
```bash
npm run free-port
npm start
```

### Option 3: Manual Windows Commands
```powershell
# Find the process
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Option 4: Use a Different Port
```bash
npm start -- -p 3001
```
Then access your app at `http://localhost:3001`

## Prevention Tips

1. **Always stop the server properly**: Use `Ctrl+C` in the terminal where the server is running
2. **Use the clean start script**: Always use `npm run start:clean` instead of `npm start`
3. **Check before starting**: Run `npm run free-port` before starting if you're unsure
4. **Use process managers**: Consider using `pm2` or similar tools for production

## Available Scripts

- `npm start` - Start the server (may fail if port is in use)
- `npm run start:clean` - **Recommended**: Free port 3000 then start server
- `npm run free-port` - Free port 3000 without starting server
- `npm run dev` - Start development server (uses port 3000 by default)

## Understanding the Scripts

The `scripts/free-port.js` script:
- Automatically detects your operating system (Windows/Linux/Mac)
- Finds all processes using port 3000
- Safely terminates those processes
- Works cross-platform

## Still Having Issues?

If the problem persists:
1. Check if you have multiple terminal windows with servers running
2. Restart your computer (nuclear option)
3. Use a different port: `npm start -- -p 3001`
